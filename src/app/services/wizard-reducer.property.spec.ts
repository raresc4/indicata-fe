import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { WizardAction, invalidFieldLabels, wizardReducer } from './wizard-reducer';
import { Cycle } from '../models/cycle.model';
import { University } from '../models/university.model';
import {
  WizardFieldValues,
  WizardState,
  WizardStepNumber,
  WizardView,
} from '../models/wizard-state.model';
import { UNIVERSITIES } from '../mocks/universities.mock';

const cycleArb: fc.Arbitrary<Cycle> = fc.constantFrom<Cycle>('Bachelor', 'Master', 'Doctorate');

const stepNumberArb: fc.Arbitrary<WizardStepNumber> = fc.constantFrom<WizardStepNumber>(1, 2, 3);

const universityArb: fc.Arbitrary<University | null> = fc.oneof(
  fc.constant<University | null>(null),
  fc.constantFrom<University>(...UNIVERSITIES),
);

const textArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.constant('   '),
  fc.string(),
  fc.constant('Faculty of Engineering'),
);

const websiteArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.constant('not a url'),
  fc.constant('https://example.com'),
  fc.webUrl(),
);

const fieldValuesArb: fc.Arbitrary<WizardFieldValues> = fc.record({
  cycle: cycleArb,
  university: universityArb,
  faculty: textArb,
  domain: textArb,
  website: websiteArb,
  reportName: textArb,
});

const validFieldValuesArb: fc.Arbitrary<WizardFieldValues> = fc.record({
  cycle: cycleArb,
  university: fc.constantFrom<University>(...UNIVERSITIES),
  faculty: fc.constant('Faculty of Engineering'),
  domain: fc.constant('Computer Engineering'),
  website: fc.oneof(fc.constant(''), fc.constant('https://example.com')),
  reportName: fc.constant('Report'),
});

const viewArb: fc.Arbitrary<WizardView> = fc.oneof(
  stepNumberArb,
  fc.constant<WizardView>('success'),
);

const stateArb: fc.Arbitrary<WizardState> = fc
  .record({
    step: viewArb,
    reachedStep: stepNumberArb,
    values: fc.oneof(fieldValuesArb, validFieldValuesArb),
    error: fc.oneof(
      fc.constant<WizardState['error']>(null),
      fc.array(fc.string()).map((invalidFields) => ({ invalidFields })),
    ),
  })
  .map((state) => ({
    ...state,
    reachedStep:
      state.step !== 'success' && state.step > state.reachedStep ? state.step : state.reachedStep,
  }));

const stepStateArb: fc.Arbitrary<WizardState> = fc
  .record({
    step: stepNumberArb,
    reachedStep: stepNumberArb,
    values: fc.oneof(fieldValuesArb, validFieldValuesArb),
    error: fc.constant<WizardState['error']>(null),
  })
  .map((state) => ({
    ...state,
    reachedStep: state.step > state.reachedStep ? state.step : state.reachedStep,
  }));

function expectedNextView(step: WizardStepNumber): WizardView {
  return step === 3 ? 'success' : ((step + 1) as WizardStepNumber);
}

describe('wizard-reducer navigation gating property', () => {
  it('Feature: project-setup-wizard, Property 2: For all wizard states, goNext advances to the next view iff the current step is valid; when invalid the step is unchanged and error is set with invalidFieldLabels, when valid the wizard advances and error is null', () => {
    fc.assert(
      fc.property(stepStateArb, (state) => {
        const currentStep = state.step as WizardStepNumber;
        const expectedInvalid = invalidFieldLabels(state);
        const isValid = expectedInvalid.length === 0;
        const next = wizardReducer(state, { type: 'goNext' });

        if (isValid) {
          expect(next.step).toBe(expectedNextView(currentStep));
          expect(next.error).toBeNull();
        } else {
          expect(next.step).toBe(currentStep);
          expect(next.error).not.toBeNull();
          expect(next.error?.invalidFields).toEqual(expectedInvalid);
        }
      }),
      { numRuns: 100 },
    );
  });
});

const navActionArb: fc.Arbitrary<WizardAction> = fc.oneof(
  stepNumberArb.map<WizardAction>((step) => ({ type: 'goTo', step })),
  fc.constant<WizardAction>({ type: 'goNext' }),
  fc.constant<WizardAction>({ type: 'goBack' }),
);

describe('wizard-reducer navigation preservation property', () => {
  it('Feature: project-setup-wizard, Property 3: For all wizard states and any sequence of navigation-only actions (goTo to a reached step, goNext, goBack), the resulting values slice deep-equals the original values slice', () => {
    fc.assert(
      fc.property(stateArb, fc.array(navActionArb, { maxLength: 12 }), (state, actions) => {
        const originalValues = structuredClone(state.values);
        const finalState = actions.reduce<WizardState>(
          (acc, action) => wizardReducer(acc, action),
          state,
        );
        expect(finalState.values).toEqual(originalValues);
      }),
      { numRuns: 100 },
    );
  });
});
