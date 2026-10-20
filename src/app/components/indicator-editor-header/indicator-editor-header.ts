import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-indicator-editor-header',
  host: {
    class: 'border-outline-variant mb-8 block border-b pb-6',
  },
  templateUrl: './indicator-editor-header.html',
})
export class IndicatorEditorHeader {
  readonly code = input.required<string>();
  readonly title = input.required<string>();
  readonly standardRef = input<string>('ESG 1.2');

  protected readonly open = signal<boolean>(true);

  protected readonly headerId = 'indicator-rubric-toggle';
  protected readonly regionId = 'indicator-rubric-region';

  protected toggle(): void {
    this.open.update((value) => !value);
  }
}
