import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { combineLatest, map } from 'rxjs';

import { EvidenceTab } from '../../models/indicator-screen-state.model';
import { citationCount } from '../../services/indicator-selectors';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { SourceCard } from '../source-card/source-card';
import { VersionDiffView } from '../version-diff-view/version-diff-view';
import { VersionRow } from '../version-row/version-row';

interface SourcesSummary {
  readonly sources: number;
  readonly claims: number;
  readonly unsourced: number;
}

const TAB_ORDER: readonly EvidenceTab[] = ['sources', 'versions', 'diff'];

@Component({
  selector: 'app-evidence-panel',
  imports: [AsyncPipe, MatTabsModule, SourceCard, VersionRow, VersionDiffView],
  host: {
    class: 'bg-surface border-outline-variant flex h-dvh w-96 shrink-0 flex-col border-l',
  },
  templateUrl: './evidence-panel.html',
})
export class EvidencePanel {
  protected readonly state = inject(IndicatorStateService);

  protected readonly sources$ = this.state.state$.pipe(map((screen) => screen.sources));
  protected readonly selectedSourceId$ = this.state.selectedSourceId$;
  protected readonly versionCount$ = this.state.state$.pipe(
    map((screen) => screen.versions.length),
  );
  protected readonly versions$ = this.state.state$.pipe(map((screen) => screen.versions));
  protected readonly activeVersionId$ = this.state.activeVersionId$;
  protected readonly diffSelection$ = this.state.diffSelection$;
  protected readonly diff$ = this.state.diff$;
  protected readonly diffReady$ = this.state.diffPair$.pipe(map((pair) => pair !== null));

  protected readonly selectedIndex$ = this.state.state$.pipe(
    map((screen) => TAB_ORDER.indexOf(screen.evidenceTab)),
  );

  protected readonly summary$ = combineLatest([this.state.state$, this.state.unsourcedCount$]).pipe(
    map(([screen, unsourced]): SourcesSummary => ({
      sources: screen.sources.length,
      claims: citationCount(screen.content),
      unsourced,
    })),
  );

  protected onTabChange(index: number): void {
    const tab = TAB_ORDER[index];
    if (tab !== undefined) {
      this.state.setEvidenceTab(tab);
    }
  }

  protected onAddDocument(): void {
    this.state.addSource({ documentTitle: 'Untitled document', provenance: 'Uploaded' });
  }

  protected isSelected(versionNumber: number, selection: readonly number[] | null): boolean {
    return selection?.includes(versionNumber) ?? false;
  }

  protected pickLabel(versionNumber: number, selection: readonly number[] | null): string {
    if (selection === null) {
      return '';
    }
    const index = selection.indexOf(versionNumber);
    if (index === -1) {
      return '';
    }
    return index === 0 ? 'A' : 'B';
  }
}
