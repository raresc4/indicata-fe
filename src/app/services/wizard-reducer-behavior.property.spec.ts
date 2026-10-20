import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  INITIAL_WIZARD_STATE,
  invalidFieldLabels,
  wizardReducer,
  WizardAction,
} from './wizard-reducer';
import { Cycle } from '../models/cycle.model';
import { University } from '../models/university.model';
import {
  WizardFieldValues,
  WizardState,
  WizardStepNumber,
  WizardValidationError,
  WizardView,
} from '../models/wizard-state.model';
import { UNIVERSITIES } from '../mocks/universities.mock';

const cycleArb: fc.Arbitrary<Cycle> = fc.constantFrom<Cycle>('Bachelor', 'Master', 'Doctorate');

const stepNumberArb: fc.Arbitrary<WizardStepNumber> = fc.constantFrom<WizardStepNumber>(1, 2, 3);

const viewArb: fc.Arbitrary<WizardView> = fc.oneof(
  stepNumberArb,
  fc.constant<WizardView>('success'),
);

const universityArb: fc.Arbitrary<University | null> = fc.oneof(
  fc.constant<University | null>(null),
  fc.constantFrom<University>(...UNIVERSITIES),
  fc.record<University>({
    id: fc.string(),
    name: fc.string(),
    city: fc.string(),
    county: fc.string(),
    acronym: fc.string(),
  }),
);

const textFieldArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.constantFrom(' ', '   ', '\t', '\n'),
  fc.string(),
  fc.string({ minLength: 1 }).map((value) => value.trim()),
);

const websiteArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.webUrl(),
  fc.string(),
  fc.constantFrom('not a url', 'http://', 'example.com'),
);

const fieldValuesArb: fc.Arbitrary<WizardFieldValues> = fc.record<WizardFieldValues>({
  cycle: cycleArb,
  university: universityArb,
  faculty: textFieldArb,
  domain: textFieldArb,
  website: websiteArb,
  reportName: textFieldArb,
});

const errorArb: fc.Arbitrary<WizardValidationError | null> = fc.oneof(
  fc.constant<WizardValidationError | null>(null),
  fc.record<WizardValidationError>({
    invalidFields: fc.array(fc.string()),
  }),
);

const wizardStateArb: fc.Arbitrary<WizardState> = fc.record<WizardState>({
  step: viewArb,
  reachedStep: stepNumberArb,
  values: fieldValuesArb,
  error: errorArb,
});

const FIELD_OWNER_STEP: Record<string, WizardStepNumber> = {
  cycle: 1,
  university: 2,
  faculty: 2,
  domain: 2,
  website: 2,
  reportName: 3,
};

function isNonBlank(value: string): boolean {
  return value.trim().length > 0;
}

function isValidOptionalUrl(value: string): boolean {
  if (value === '') {
    return true;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function expectedInvalidLabels(state: WizardState): readonly string[] {
  if (state.step === 'success') {
    return [];
  }
  const values = state.values;
  const labels: string[] = [];
  if (state.step === 1) {
    const validCycle =
      values.cycle === 'Bachelor' || values.cycle === 'Master' || values.cycle === 'Doctorate';
    if (!validCycle) {
      labels.push('Study cycle');
    }
  } else if (state.step === 2) {
    const university = values.university;
    const validUniversity =
      university !== null && typeof university.id === 'string' && university.id.length > 0;
    if (!validUniversity) {
      labels.push('University');
    }
    if (!isNonBlank(values.faculty)) {
      labels.push('Faculty');
    }
    if (!isNonBlank(values.domain)) {
      labels.push('Study domain');
    }
    if (!isValidOptionalUrl(values.website)) {
      labels.push('University website');
    }
  } else {
    if (!isNonBlank(values.reportName)) {
      labels.push('Report name');
    }
  }
  return labels;
}

describe('wizard-reducer behavior properties', () => {
  it('Feature: project-setup-wizard, Property 11: Edit navigates to the owning step', () => {
    const fieldArb = fc.constantFrom(...Object.keys(FIELD_OWNER_STEP));
    fc.assert(
      fc.property(wizardStateArb, fieldArb, (state, field) => {
        const ownerStep = FIELD_OWNER_STEP[field];
        const action: WizardAction = { type: 'goTo', step: ownerStep };
        const next = wizardReducer(state, action);
        if (ownerStep <= state.reachedStep) {
          expect(next.step).toBe(ownerStep);
          expect(next.error).toBeNull();
        } else {
          expect(next).toBe(state);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Feature: project-setup-wizard, Property 12: Reset returns the canonical initial state', () => {
    fc.assert(
      fc.property(wizardStateArb, (state) => {
        const next = wizardReducer(state, { type: 'reset' });
        expect(next).toEqual(INITIAL_WIZARD_STATE);
        expect(next.step).toBe(1);
        expect(next.reachedStep).toBe(1);
        expect(next.values.cycle).toBe('Doctorate');
        expect(next.error).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it('Feature: project-setup-wizard, Property 13: Invalid-fields projection matches the banner and ARIA', () => {
    fc.assert(
      fc.property(wizardStateArb, (state) => {
        const actual = invalidFieldLabels(state);
        const expected = expectedInvalidLabels(state);
        expect([...actual]).toEqual([...expected]);
        const stepValid = state.step !== 'success' ? expected.length === 0 : actual.length === 0;
        expect(actual.length === 0).toBe(stepValid);
      }),
      { numRuns: 100 },
    );
  });
});
