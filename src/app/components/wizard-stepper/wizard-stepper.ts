import { Component, input, output } from '@angular/core';
import { WizardStepNumber } from '../../models/wizard-state.model';
import { StepStatus, stepStatus } from '../../services/wizard-selectors';

interface WizardStepDescriptor {
  readonly number: WizardStepNumber;
  readonly label: string;
}

export const WIZARD_STEPS: readonly WizardStepDescriptor[] = [
  { number: 1, label: 'Cycle' },
  { number: 2, label: 'Institution' },
  { number: 3, label: 'Review' },
];

@Component({
  selector: 'app-wizard-stepper',
  templateUrl: './wizard-stepper.html',
})
export class WizardStepper {
  readonly activeStep = input.required<WizardStepNumber>();
  readonly reachedStep = input.required<WizardStepNumber>();
  readonly select = output<WizardStepNumber>();

  protected readonly steps = WIZARD_STEPS;
  protected readonly totalSteps = WIZARD_STEPS.length;

  protected statusOf(step: WizardStepNumber): StepStatus {
    if (step > this.reachedStep()) {
      return 'inactive';
    }
    return stepStatus(this.activeStep(), step);
  }

  protected isSelectable(step: WizardStepNumber): boolean {
    return step <= this.reachedStep();
  }

  protected activeLabel(): string {
    const active = this.activeStep();
    return WIZARD_STEPS[active - 1].label;
  }

  protected progressValue(): number {
    return Math.round((this.activeStep() / this.totalSteps) * 100);
  }

  protected accessibleLabel(step: WizardStepDescriptor): string {
    const status = this.statusOf(step.number);
    const suffix =
      status === 'completed' ? 'completed' : status === 'active' ? 'current step' : 'not available';
    return `Step ${step.number} of ${this.totalSteps}: ${step.label}, ${suffix}`;
  }

  protected onSelect(step: WizardStepNumber): void {
    if (this.isSelectable(step)) {
      this.select.emit(step);
    }
  }
}
