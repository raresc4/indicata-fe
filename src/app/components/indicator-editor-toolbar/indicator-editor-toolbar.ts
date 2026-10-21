import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { IndicatorViewToken } from '../../services/indicator-selectors';
import { IndicatorStateService } from '../../services/indicator-state.service';

interface StatusBadge {
  readonly label: string;
  readonly classes: string;
  readonly spinning: boolean;
}

const STATUS_BADGE: Record<IndicatorViewToken, StatusBadge> = {
  empty: {
    label: 'Empty',
    classes: 'bg-surface-container-high border-outline-variant text-on-surface-variant',
    spinning: false,
  },
  generating: {
    label: 'Synthesizing…',
    classes: 'bg-primary-container border-primary/30 text-on-primary-container',
    spinning: true,
  },
  draft: {
    label: 'AI Draft',
    classes: 'bg-primary-container border-primary/30 text-on-primary-container',
    spinning: false,
  },
};

@Component({
  selector: 'app-indicator-editor-toolbar',
  imports: [AsyncPipe],
  host: {
    class:
      'bg-surface/95 border-outline-variant sticky top-0 z-20 flex w-full items-center justify-between gap-3 border-b px-6 py-2.5 backdrop-blur-xs',
  },
  templateUrl: './indicator-editor-toolbar.html',
})
export class IndicatorEditorToolbar {
  private readonly state = inject(IndicatorStateService);

  readonly code = input.required<string>();
  readonly viewToken = input<IndicatorViewToken>('empty');

  readonly generate = output<void>();
  readonly markReviewed = output<void>();
  readonly save = output<void>();

  protected readonly saveStatus$ = this.state.saveStatus$;

  protected readonly currentVersionLabel$ = combineLatest([
    this.state.activeVersionId$,
    this.state.state$.pipe(map((screen) => screen.versions)),
  ]).pipe(
    map(([activeVersionId, versions]) => {
      if (activeVersionId === null) {
        return '';
      }
      const version = versions.find((item) => item.id === activeVersionId);
      return version === undefined ? '' : `v${version.versionNumber}`;
    }),
  );

  protected readonly canSave$ = combineLatest([
    this.state.activeVersionId$,
    this.state.state$.pipe(map((screen) => screen.content !== null)),
    this.state.saveStatus$,
  ]).pipe(
    map(
      ([activeVersionId, hasContent, saveStatus]) =>
        activeVersionId !== null && hasContent && saveStatus !== 'saving',
    ),
  );

  protected readonly badge = computed<StatusBadge>(() => STATUS_BADGE[this.viewToken()]);

  protected onGenerate(): void {
    this.generate.emit();
    this.state.generate();
  }

  protected onMarkReviewed(): void {
    this.markReviewed.emit();
  }

  protected onSave(): void {
    this.save.emit();
  }
}
