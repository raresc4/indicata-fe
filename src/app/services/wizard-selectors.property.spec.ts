import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { stepStatus } from './wizard-selectors';
import { WizardStepNumber } from '../models/wizard-state.model';

const stepNumberArb: fc.Arbitrary<WizardStepNumber> = fc.constantFrom<WizardStepNumber>(1, 2, 3);

describe('wizard-selectors properties', () => {
  it("Feature: project-setup-wizard, Property 1: For all active in 1..3 and step in 1..3, stepStatus is 'completed' when step<active, 'active' when step===active, 'inactive' when step>active", () => {
    fc.assert(
      fc.property(stepNumberArb, stepNumberArb, (active, step) => {
        const status = stepStatus(active, step);
        if (step < active) {
          expect(status).toBe('completed');
        } else if (step === active) {
          expect(status).toBe('active');
        } else {
          expect(status).toBe('inactive');
        }
      }),
      { numRuns: 100 },
    );
  });
});
