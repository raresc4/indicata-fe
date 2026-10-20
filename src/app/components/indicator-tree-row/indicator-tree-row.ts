import { Component, computed, input, output } from '@angular/core';

import { IndicatorTreeStatus } from '../../models/indicator.model';

interface StatusPresentation {
  readonly label: string;
  readonly dot: string;
  readonly badge: string;
}

const STATUS_PRESENTATION: Record<IndicatorTreeStatus, StatusPresentation> = {
  empty: {
    label: 'Empty',
    dot: 'bg-outline',
    badge: 'text-on-surface-variant',
  },
  draft: {
    label: 'Draft',
    dot: 'bg-primary',
    badge: 'text-primary',
  },
  review: {
    label: 'Review',
    dot: 'bg-warning',
    badge: 'text-warning',
  },
};

@Component({
  selector: 'app-indicator-tree-row',
  host: {
    role: 'button',
    class:
      'focus-visible:ring-primary/50 group flex cursor-pointer items-start gap-2 rounded px-2.5 py-1.5 text-xs transition focus-visible:ring-2 focus-visible:outline-none',
    '[class.bg-primary-container]': 'active()',
    '[class.text-on-primary-container]': 'active()',
    '[class.border-l-2]': 'active()',
    '[class.border-primary]': 'active()',
    '[class.text-on-surface-variant]': '!active()',
    '[class.hover:bg-surface-container]': '!active()',
    '[attr.aria-current]': 'active() ? "true" : null',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.tabindex]': 'tabIndex()',
    '(click)': 'emitSelect()',
    '(keydown)': 'onKeydown($event)',
  },
  templateUrl: './indicator-tree-row.html',
})
export class IndicatorTreeRow {
  readonly code = input.required<string>();
  readonly title = input.required<string>();
  readonly status = input.required<IndicatorTreeStatus>();
  readonly active = input<boolean>(false);
  readonly tabIndex = input<0 | -1>(0);
  readonly select = output<string>();

  protected readonly presentation = computed<StatusPresentation>(
    () => STATUS_PRESENTATION[this.status()],
  );

  protected readonly ariaLabel = computed<string>(
    () => `${this.code()} ${this.title()}, ${this.presentation().label}`,
  );

  protected emitSelect(): void {
    this.select.emit(this.code());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.emitSelect();
    }
  }
}
