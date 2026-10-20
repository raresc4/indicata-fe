import { Cycle } from '../models/cycle.model';
import {
  WizardFieldValues,
  WizardState,
  WizardStepNumber,
  WizardView,
} from '../models/wizard-state.model';

const INITIAL_WIZARD_FIELD_VALUES: WizardFieldValues = {
  cycle: 'Doctorate',
  university: null,
  faculty: '',
  domain: '',
  website: '',
  reportName: '',
};

export const INITIAL_WIZARD_STATE: WizardState = Object.freeze({
  step: 1,
  reachedStep: 1,
  values: Object.freeze({ ...INITIAL_WIZARD_FIELD_VALUES }),
  error: null,
});

export type WizardAction =
  | { readonly type: 'setCycle'; readonly cycle: Cycle }
  | { readonly type: 'patchStep'; readonly values: Partial<WizardFieldValues> }
  | { readonly type: 'goTo'; readonly step: WizardStepNumber }
  | { readonly type: 'goNext' }
  | { readonly type: 'goBack' }
  | { readonly type: 'setValidationError'; readonly invalidFields: readonly string[] }
  | { readonly type: 'clearValidationError' }
  | { readonly type: 'create' }
  | { readonly type: 'reset' };

interface FieldDescriptor {
  readonly key: keyof WizardFieldValues;
  readonly label: string;
  readonly isValid: (values: WizardFieldValues) => boolean;
  readonly appliesTo?: (values: WizardFieldValues) => boolean;
}

const STEP_FIELDS: Record<WizardStepNumber, readonly FieldDescriptor[]> = {
  1: [{ key: 'cycle', label: 'Study cycle', isValid: (values) => isSelectedCycle(values.cycle) }],
  2: [
    { key: 'university', label: 'University', isValid: (values) => isSelectedUniversity(values) },
    { key: 'faculty', label: 'Faculty', isValid: (values) => isNonBlank(values.faculty) },
    { key: 'domain', label: 'Study domain', isValid: (values) => isNonBlank(values.domain) },
    {
      key: 'website',
      label: 'University website',
      isValid: (values) => isValidOptionalUrl(values.website),
    },
  ],
  3: [
    { key: 'reportName', label: 'Report name', isValid: (values) => isNonBlank(values.reportName) },
  ],
};

function isSelectedCycle(cycle: Cycle): boolean {
  return cycle === 'Bachelor' || cycle === 'Master' || cycle === 'Doctorate';
}

function isSelectedUniversity(values: WizardFieldValues): boolean {
  const university = values.university;
  return university !== null && typeof university.id === 'string' && university.id.length > 0;
}

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

function fieldsForStep(
  step: WizardStepNumber,
  values: WizardFieldValues,
): readonly FieldDescriptor[] {
  return STEP_FIELDS[step].filter((field) => (field.appliesTo ? field.appliesTo(values) : true));
}

function isStepNumber(view: WizardView): view is WizardStepNumber {
  return view !== 'success';
}

function isStepValid(step: WizardStepNumber, values: WizardFieldValues): boolean {
  return fieldsForStep(step, values).every((field) => field.isValid(values));
}

export function invalidFieldLabels(state: WizardState): readonly string[] {
  if (!isStepNumber(state.step)) {
    return [];
  }
  return fieldsForStep(state.step, state.values)
    .filter((field) => !field.isValid(state.values))
    .map((field) => field.label);
}

export function defaultReportName(state: WizardState): string {
  const values = state.values;
  const acronym = values.university?.acronym ?? '';
  const domain = values.domain.trim();
  return [values.cycle, acronym, domain]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(' - ');
}

function reachedAfter(current: WizardStepNumber, next: WizardStepNumber): WizardStepNumber {
  return (next > current ? next : current) as WizardStepNumber;
}

function nextStep(step: WizardStepNumber): WizardStepNumber {
  return (step < 3 ? step + 1 : 3) as WizardStepNumber;
}

function previousStep(step: WizardStepNumber): WizardStepNumber {
  return (step > 1 ? step - 1 : 1) as WizardStepNumber;
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'setCycle':
      return {
        ...state,
        values: { ...state.values, cycle: action.cycle },
      };
    case 'patchStep':
      return {
        ...state,
        values: { ...state.values, ...action.values },
      };
    case 'goTo': {
      if (action.step > state.reachedStep) {
        return state;
      }
      return { ...state, step: action.step, error: null };
    }
    case 'goNext': {
      if (!isStepNumber(state.step)) {
        return state;
      }
      if (!isStepValid(state.step, state.values)) {
        return {
          ...state,
          error: { invalidFields: invalidFieldLabels(state) },
        };
      }
      if (state.step === 3) {
        return { ...state, step: 'success', error: null };
      }
      const target = nextStep(state.step);
      return {
        ...state,
        step: target,
        reachedStep: reachedAfter(state.reachedStep, target),
        error: null,
      };
    }
    case 'goBack': {
      if (!isStepNumber(state.step)) {
        return state;
      }
      return { ...state, step: previousStep(state.step), error: null };
    }
    case 'setValidationError':
      return {
        ...state,
        error: { invalidFields: [...action.invalidFields] },
      };
    case 'clearValidationError':
      return { ...state, error: null };
    case 'create': {
      if (!isStepNumber(state.step)) {
        return state;
      }
      if (!isStepValid(state.step, state.values)) {
        return {
          ...state,
          error: { invalidFields: invalidFieldLabels(state) },
        };
      }
      return { ...state, step: 'success', error: null };
    }
    case 'reset':
      return {
        step: 1,
        reachedStep: 1,
        values: { ...INITIAL_WIZARD_FIELD_VALUES },
        error: null,
      };
  }
}
