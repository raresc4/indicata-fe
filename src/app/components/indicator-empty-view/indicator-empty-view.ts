import { Component, output } from '@angular/core';

@Component({
  selector: 'app-indicator-empty-view',
  host: {
    class:
      'border-outline-variant bg-surface flex min-h-[460px] flex-col items-center justify-center rounded-xl border p-12 text-center',
  },
  templateUrl: './indicator-empty-view.html',
})
export class IndicatorEmptyView {
  readonly generate = output<void>();
  readonly uploadSources = output<void>();
}
