import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Cycle } from '../models/cycle.model';
import { WizardFieldValues, WizardState, WizardStepNumber } from '../models/wizard-state.model';
import { INITIAL_WIZARD_STATE, WizardAction, wizardReducer } from './wizard-reducer';

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private readonly subject = new BehaviorSubject<WizardState>(INITIAL_WIZARD_STATE);
  readonly state$: Observable<WizardState> = this.subject.asObservable();

  get snapshot(): WizardState {
    return this.subject.value;
  }

  setCycle(cycle: Cycle): void {
    this.dispatch({ type: 'setCycle', cycle });
  }

  patchStep(values: Partial<WizardFieldValues>): void {
    this.dispatch({ type: 'patchStep', values });
  }

  goTo(step: WizardStepNumber): void {
    this.dispatch({ type: 'goTo', step });
  }

  goNext(): void {
    this.dispatch({ type: 'goNext' });
  }

  goBack(): void {
    this.dispatch({ type: 'goBack' });
  }

  setValidationError(invalidFields: readonly string[]): void {
    this.dispatch({ type: 'setValidationError', invalidFields });
  }

  clearValidationError(): void {
    this.dispatch({ type: 'clearValidationError' });
  }

  create(): void {
    this.dispatch({ type: 'create' });
  }

  reset(): void {
    this.dispatch({ type: 'reset' });
  }

  private dispatch(action: WizardAction): void {
    const current = this.subject.value;
    const next = wizardReducer(current, action);
    if (next !== current) {
      this.subject.next(next);
    }
  }
}
