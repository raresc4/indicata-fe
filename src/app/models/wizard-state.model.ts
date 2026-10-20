import { Cycle } from './cycle.model';
import { University } from './university.model';

export type WizardStepNumber = 1 | 2 | 3;
export type WizardView = WizardStepNumber | 'success';

export interface WizardValidationError {
  readonly invalidFields: readonly string[];
}

export interface WizardFieldValues {
  readonly cycle: Cycle;
  readonly university: University | null;
  readonly faculty: string;
  readonly domain: string;
  readonly website: string;
  readonly reportName: string;
}

export interface WizardState {
  readonly step: WizardView;
  readonly reachedStep: WizardStepNumber;
  readonly values: WizardFieldValues;
  readonly error: WizardValidationError | null;
}
