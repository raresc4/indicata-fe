import { Component, ElementRef, inject, input, viewChildren } from '@angular/core';

import { Cycle } from '../../models/cycle.model';
import { CYCLE_OPTIONS } from '../../mocks/cycle-options.mock';
import { WizardStateService } from '../../services/wizard-state.service';
import { SelectableCycleCard } from '../selectable-cycle-card/selectable-cycle-card';

@Component({
  selector: 'app-wizard-step-cycle',
  imports: [SelectableCycleCard],
  templateUrl: './wizard-step-cycle.html',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class WizardStepCycle {
  private readonly state = inject(WizardStateService);

  protected readonly cycles = CYCLE_OPTIONS;
  readonly selected = input.required<Cycle>();

  private readonly cards = viewChildren(SelectableCycleCard, { read: ElementRef });

  protected tabIndexFor(cycle: Cycle): 0 | -1 {
    return cycle === this.selected() ? 0 : -1;
  }

  protected select(cycle: Cycle): void {
    this.state.setCycle(cycle);
  }

  protected goNext(): void {
    this.state.goNext();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const delta = this.deltaFor(event.key);
    if (delta === 0) {
      return;
    }
    event.preventDefault();
    const size = this.cycles.length;
    const current = this.cycles.findIndex((option) => option.value === this.selected());
    const next = (current + delta + size) % size;
    const nextCycle = this.cycles[next].value;
    this.state.setCycle(nextCycle);
    this.focusCard(next);
  }

  private deltaFor(key: string): -1 | 0 | 1 {
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      return 1;
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      return -1;
    }
    return 0;
  }

  private focusCard(index: number): void {
    const elements = this.cards();
    const element = elements[index];
    if (element) {
      (element.nativeElement as HTMLElement).focus();
    }
  }
}
