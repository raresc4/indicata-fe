import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { University } from '../models/university.model';
import { UNIVERSITIES } from '../mocks/universities.mock';

export function filterUniversities(
  options: readonly University[],
  query: string,
): readonly University[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return options;
  }
  return options.filter((option) => option.name.toLowerCase().includes(normalized));
}

export function isSelectedUniversity(
  value: unknown,
  options: readonly University[] = UNIVERSITIES,
): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<University>;
  if (typeof candidate.id !== 'string') {
    return false;
  }
  return options.some((option) => option.id === candidate.id);
}

export const selectedUniversityValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  return isSelectedUniversity(control.value) ? null : { universityNotSelected: true };
};

export function isNonBlank(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export const nonBlankValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  return isNonBlank(control.value) ? null : { blank: true };
};

export function isValidOptionalUrl(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export const optionalUrlValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  return isValidOptionalUrl(control.value) ? null : { invalidUrl: true };
};
