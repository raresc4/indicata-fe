import { AsyncPipe } from '@angular/common';
import { afterRenderEffect, Component, ElementRef, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  WizardStepNumber,
  WizardValidationError,
  WizardView,
} from '../../models/wizard-state.model';
import { WizardStateService } from '../../services/wizard-state.service';
import { WizardErrorBanner } from '../wizard-error-banner/wizard-error-banner';
import { WizardStepper } from '../wizard-stepper/wizard-stepper';
import { WizardStepCycle } from '../wizard-step-cycle/wizard-step-cycle';
import { WizardStepInstitution } from '../wizard-step-institution/wizard-step-institution';
import { WizardStepReview } from '../wizard-step-review/wizard-step-review';
import { WizardSuccessView } from '../wizard-success-view/wizard-success-view';

@Component({
  selector: 'app-project-setup-wizard-page',
  imports: [
    AsyncPipe,
    WizardStepper,
    WizardErrorBanner,
    WizardStepCycle,
    WizardStepInstitution,
    WizardStepReview,
    WizardSuccessView,
  ],
  templateUrl: './project-setup-wizard-page.html',
})
export class ProjectSetupWizardPage {
  private readonly state = inject(WizardStateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly vm$ = this.state.state$;
  private readonly vm = toSignal(this.state.state$);
  private readonly banner = viewChild(WizardErrorBanner);

  private previousStep: WizardView | null = null;
  private previousError: WizardValidationError | null = null;

  constructor() {
    afterRenderEffect(() => {
      const current = this.vm();
      if (!current) {
        return;
      }

      const errorChanged = current.error !== null && current.error !== this.previousError;
      const stepChanged = current.step !== this.previousStep;
      this.previousStep = current.step;
      this.previousError = current.error;

      if (errorChanged) {
        this.banner()?.focus();
      } else if (current.error === null && stepChanged) {
        this.focusStepHeading();
      }
    });
  }

  protected onSelectStep(step: WizardStepNumber): void {
    this.state.goTo(step);
  }

  private focusStepHeading(): void {
    const heading = this.host.nativeElement.querySelector<HTMLElement>('main h1[tabindex="-1"]');
    heading?.focus();
  }
}
