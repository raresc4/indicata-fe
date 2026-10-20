import { Cycle } from '../models/cycle.model';
import { Step3Copy } from '../models/step3-copy.model';
import { WizardStepNumber } from '../models/wizard-state.model';
import { DOMAINS_BY_CYCLE } from '../mocks/domains.mock';
import { DOCTORATE_STEP3_COPY, NON_DOCTORATE_STEP3_COPY } from '../mocks/step3-copy.mock';

export type StepStatus = 'completed' | 'active' | 'inactive';

export function stepStatus(active: WizardStepNumber, step: WizardStepNumber): StepStatus {
  if (step < active) {
    return 'completed';
  }
  if (step === active) {
    return 'active';
  }
  return 'inactive';
}

export function step3CopyFor(cycle: Cycle): Step3Copy {
  return cycle === 'Doctorate' ? DOCTORATE_STEP3_COPY : NON_DOCTORATE_STEP3_COPY;
}

export function domainOptionsFor(cycle: Cycle): readonly string[] {
  return DOMAINS_BY_CYCLE[cycle];
}
