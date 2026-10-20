import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { adjacentCode, flattenRows } from '../../services/indicator-selectors';
import { IndicatorStateService } from '../../services/indicator-state.service';

interface NavView {
  readonly position: number;
  readonly total: number;
  readonly prevCode: string | null;
  readonly nextCode: string | null;
}

@Component({
  selector: 'app-indicator-action-bar',
  imports: [AsyncPipe],
  host: {
    class:
      'bg-surface/95 border-outline-variant sticky bottom-0 z-20 flex w-full items-center justify-between gap-3 border-t px-8 py-3 backdrop-blur-xs',
  },
  templateUrl: './indicator-action-bar.html',
})
export class IndicatorActionBar {
  protected readonly state = inject(IndicatorStateService);

  protected readonly nav$ = combineLatest([this.state.state$, this.state.activeIndicator$]).pipe(
    map(([screenState, active]): NavView => {
      const rows = flattenRows(screenState.tree);
      const code = active?.code ?? null;
      const index = code === null ? -1 : rows.findIndex((row) => row.code === code);
      return {
        position: index === -1 ? 0 : index + 1,
        total: rows.length,
        prevCode: code === null ? null : adjacentCode(screenState.tree, code, 'prev'),
        nextCode: code === null ? null : adjacentCode(screenState.tree, code, 'next'),
      };
    }),
  );
}
