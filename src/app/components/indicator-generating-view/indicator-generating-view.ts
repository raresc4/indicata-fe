import { Component } from '@angular/core';

@Component({
  selector: 'app-indicator-generating-view',
  styleUrl: './indicator-generating-view.scss',
  host: {
    class: 'border-outline-variant bg-surface block rounded-xl border p-8 sm:p-12',
  },
  templateUrl: './indicator-generating-view.html',
})
export class IndicatorGeneratingView {}
