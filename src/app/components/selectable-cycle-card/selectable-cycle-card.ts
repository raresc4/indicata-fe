import { Component, input, output } from '@angular/core';
import { Cycle, CycleOption } from '../../models/cycle.model';

@Component({
  selector: 'app-selectable-cycle-card',
  templateUrl: './selectable-cycle-card.html',
  host: {
    role: 'radio',
    class:
      'focus-visible:ring-primary/40 relative flex min-h-11 cursor-pointer flex-col justify-between rounded-xl border p-5 transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none',
    '[class.border-outline-variant]': '!checked()',
    '[class.bg-surface-container-lowest]': '!checked()',
    '[class.border-primary]': 'checked()',
    '[class.border-2]': 'checked()',
    '[class.bg-primary-container]': 'checked()',
    '[attr.aria-checked]': 'checked()',
    '[attr.tabindex]': 'tabIndex()',
    '(click)': 'emitPick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class SelectableCycleCard {
  readonly cycle = input.required<CycleOption>();
  readonly checked = input.required<boolean>();
  readonly tabIndex = input.required<0 | -1>();
  readonly pick = output<Cycle>();

  protected emitPick(): void {
    this.pick.emit(this.cycle().value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.emitPick();
    }
  }
}
