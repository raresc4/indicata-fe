import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { IndicatorContent } from '../models/indicator-content.model';
import {
  EvidenceTab,
  IndicatorScreenState,
  SaveStatus,
} from '../models/indicator-screen-state.model';
import { Indicator, IndicatorTreeStatus } from '../models/indicator.model';
import { AddSourceRequest, DocumentApiService } from './document-api.service';
import { buildIndicatorTree, codeToIdMap } from './indicator-api.mapper';
import { IndicatorApiService, LoadedVersion, VersionDiff } from './indicator-api.service';
import {
  INITIAL_INDICATOR_SCREEN_STATE,
  IndicatorAction,
  indicatorReducer,
} from './indicator-reducer';
import {
  IndicatorProgress,
  IndicatorViewToken,
  adjacentCode,
  progress,
  unsourcedCount,
  viewTokenFor,
} from './indicator-selectors';

@Injectable({ providedIn: 'root' })
export class IndicatorStateService {
  private readonly api = inject(IndicatorApiService);
  private readonly documents = inject(DocumentApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly generateTrigger = new Subject<string>();

  private codeToId: ReadonlyMap<string, string> = new Map<string, string>();
  private projectId: string | null = null;

  private readonly subject = new BehaviorSubject<IndicatorScreenState>(
    INITIAL_INDICATOR_SCREEN_STATE,
  );
  readonly state$: Observable<IndicatorScreenState> = this.subject.asObservable();

  readonly activeIndicator$: Observable<Indicator | null> = this.state$.pipe(
    map((state) => state.activeIndicator),
    distinctUntilChanged(),
  );

  readonly unsourcedCount$: Observable<number> = this.state$.pipe(
    map((state) => unsourcedCount(state.content)),
    distinctUntilChanged(),
  );

  readonly progress$: Observable<IndicatorProgress> = this.state$.pipe(
    map((state) => progress(state.tree)),
    distinctUntilChanged(
      (a, b) => a.reviewed === b.reviewed && a.total === b.total && a.ratio === b.ratio,
    ),
  );

  readonly selectedSourceId$: Observable<number | null> = this.state$.pipe(
    map((state) => state.selectedSourceId),
    distinctUntilChanged(),
  );

  readonly saveStatus$: Observable<SaveStatus> = this.state$.pipe(
    map((state) => state.saveStatus),
    distinctUntilChanged(),
  );

  readonly activeVersionId$: Observable<string | null> = this.state$.pipe(
    map((state) => state.activeVersionId),
    distinctUntilChanged(),
  );

  readonly diffSelection$: Observable<readonly number[]> = this.state$.pipe(
    map((state) => state.diffSelection),
    distinctUntilChanged((a, b) => a.length === b.length && a.every((v, i) => v === b[i])),
  );

  readonly diffPair$: Observable<readonly [number, number] | null> = this.diffSelection$.pipe(
    map((selection) => {
      if (selection.length < 2) {
        return null;
      }
      const [a, b] = selection;
      return (a < b ? [a, b] : [b, a]) as [number, number];
    }),
    distinctUntilChanged((a, b) =>
      a === null || b === null ? a === b : a[0] === b[0] && a[1] === b[1],
    ),
  );

  readonly diff$: Observable<VersionDiff | null> = this.state$.pipe(
    map((state) => {
      const code = state.activeIndicator?.code ?? null;
      if (code === null || state.diffSelection.length < 2) {
        return null;
      }
      const [a, b] = state.diffSelection;
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      return { code, from, to };
    }),
    distinctUntilChanged(
      (a, b) =>
        (a === null) === (b === null) &&
        (a === null || (a.code === b?.code && a.from === b?.from && a.to === b?.to)),
    ),
    switchMap((request) =>
      request === null ? of(null) : this.api.getDiff(request.code, request.from, request.to),
    ),
  );

  readonly viewToken$: Observable<IndicatorViewToken> = this.state$.pipe(
    map((state) => {
      const status = state.activeIndicator?.status ?? 'empty';
      if (status === 'ready' && state.content === null) {
        return 'empty';
      }
      return viewTokenFor(status);
    }),
    distinctUntilChanged(),
  );

  constructor() {
    this.generateTrigger
      .pipe(
        switchMap((code) => {
          const indicatorId = this.codeToId.get(code);
          if (indicatorId === undefined) {
            return of(null);
          }
          return this.api.generate(indicatorId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (detail) => {
          if (detail !== null) {
            this.dispatch({ type: 'finishGenerating', detail });
          }
        },
        error: () => this.dispatch({ type: 'setSaveStatus', status: 'error' }),
      });
  }

  get snapshot(): IndicatorScreenState {
    return this.subject.value;
  }

  loadProjectIndicators(projectId: string): void {
    this.projectId = projectId;
    this.api.getProjectIndicators(projectId).subscribe((items) => {
      this.codeToId = codeToIdMap(items);
      this.dispatch({ type: 'setTree', tree: buildIndicatorTree(items) });
    });
  }

  loadTree(projectId: string): void {
    this.loadProjectIndicators(projectId);
  }

  selectIndicator(code: string): void {
    const id = this.codeToId.get(code);
    if (id === undefined) {
      return;
    }
    this.api.getIndicatorDetail(id).subscribe((detail) => {
      this.dispatch({ type: 'loadIndicator', detail });
    });
  }

  loadVersion(versionId: string): void {
    const indicatorId = this.snapshot.activeIndicator?.id;
    if (indicatorId === undefined) {
      return;
    }
    if (this.snapshot.activeVersionId === versionId) {
      return;
    }
    if (
      this.snapshot.currentVersionId === versionId &&
      this.snapshot.currentVersionContent !== null
    ) {
      this.dispatch({ type: 'loadCurrentVersion' });
      return;
    }
    this.api.getVersion(indicatorId, versionId).subscribe({
      next: (loaded: LoadedVersion) =>
        this.dispatch({
          type: 'loadVersionContent',
          content: loaded.content,
          versionId: loaded.versionId,
        }),
      error: () => this.dispatch({ type: 'setSaveStatus', status: 'error' }),
    });
  }

  goPrev(): void {
    this.moveTo('prev');
  }

  goNext(): void {
    this.moveTo('next');
  }

  setFilter(query: string, statuses: readonly IndicatorTreeStatus[]): void {
    this.dispatch({ type: 'setFilter', query, statuses });
  }

  toggleDomain(id: string): void {
    this.dispatch({ type: 'toggleDomain', id });
  }

  selectSource(ref: number | null): void {
    this.dispatch({ type: 'selectSource', ref });
  }

  highlightCitation(ref: number): void {
    this.dispatch({ type: 'selectSource', ref });
  }

  setEvidenceTab(tab: EvidenceTab): void {
    this.dispatch({ type: 'setEvidenceTab', tab });
  }

  toggleDiffVersion(versionNumber: number): void {
    this.dispatch({ type: 'toggleDiffVersion', versionNumber });
  }

  clearDiffVersions(): void {
    this.dispatch({ type: 'clearDiffVersions' });
  }

  addSource(request: AddSourceRequest): void {
    const code = this.snapshot.activeIndicator?.code;
    if (code === undefined) {
      return;
    }
    this.documents.addSource(code, request).subscribe((source) => {
      this.dispatch({ type: 'addSource', source });
    });
  }

  applyEdit(patch: IndicatorContent): void {
    this.dispatch({ type: 'applyContent', content: patch });
    const code = this.snapshot.activeIndicator?.code;
    if (code === undefined) {
      return;
    }
    this.dispatch({ type: 'setSaveStatus', status: 'saving' });
    this.api.autosave(code, patch).subscribe({
      next: () => this.dispatch({ type: 'setSaveStatus', status: 'saved' }),
      error: () => this.dispatch({ type: 'setSaveStatus', status: 'error' }),
    });
  }

  generate(code?: string): void {
    const target = code ?? this.snapshot.activeIndicator?.code;
    if (target === undefined) {
      return;
    }
    this.dispatch({ type: 'startGenerating' });
    this.generateTrigger.next(target);
  }

  saveActiveVersion(): void {
    const indicatorId = this.snapshot.activeIndicator?.id;
    const versionId = this.snapshot.activeVersionId;
    const content = this.snapshot.content;
    if (indicatorId === undefined || versionId === null || content === null) {
      return;
    }
    this.dispatch({ type: 'setSaveStatus', status: 'saving' });
    this.api.saveVersion(indicatorId, versionId, content).subscribe({
      next: (detail) => {
        this.dispatch({ type: 'finishGenerating', detail });
        this.dispatch({ type: 'setSaveStatus', status: 'saved' });
      },
      error: () => this.dispatch({ type: 'setSaveStatus', status: 'error' }),
    });
  }

  setSaveStatus(status: SaveStatus): void {
    this.dispatch({ type: 'setSaveStatus', status });
  }

  private moveTo(direction: 'prev' | 'next'): void {
    const state = this.snapshot;
    const current = state.activeIndicator?.code;
    if (current === undefined) {
      return;
    }
    const target = adjacentCode(state.tree, current, direction);
    if (target === null) {
      return;
    }
    this.selectIndicator(target);
  }

  private dispatch(action: IndicatorAction): void {
    const current = this.subject.value;
    const next = indicatorReducer(current, action);
    if (next !== current) {
      this.subject.next(next);
    }
  }
}
