import { Component, ElementRef, computed, effect, inject, input, output } from '@angular/core';

import { IndicatorSource, SourceType } from '../../models/indicator-source.model';

const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  upload: 'PDF',
  crawl: 'WEB',
  search: 'DOC',
};

@Component({
  selector: 'app-source-card',
  host: {
    class: 'block',
  },
  templateUrl: './source-card.html',
})
export class SourceCard {
  readonly source = input.required<IndicatorSource>();
  readonly selected = input<boolean>(false);

  readonly select = output<number>();
  readonly openDocument = output<string>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
      if (!this.selected()) {
        return;
      }
      const node = this.element.nativeElement;
      if (typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  protected readonly meta = computed<string>(() => {
    const source = this.source();
    const type = SOURCE_TYPE_LABEL[source.sourceType];
    return source.page === undefined ? type : `${type} · p. ${source.page}`;
  });

  protected readonly selectLabel = computed<string>(
    () => `Source ${this.source().ref}, ${this.source().documentTitle}`,
  );

  protected readonly openLabel = computed<string>(
    () => `Open document ${this.source().documentTitle}`,
  );

  protected emitSelect(): void {
    this.select.emit(this.source().ref);
  }

  protected emitOpen(): void {
    this.openDocument.emit(this.source().documentId);
  }
}
