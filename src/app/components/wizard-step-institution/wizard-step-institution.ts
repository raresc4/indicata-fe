import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Cycle } from '../../models/cycle.model';
import { Step3Copy } from '../../models/step3-copy.model';
import { University } from '../../models/university.model';
import { WizardStateService } from '../../services/wizard-state.service';
import { domainOptionsFor, step3CopyFor } from '../../services/wizard-selectors';
import {
  nonBlankValidator,
  optionalUrlValidator,
  selectedUniversityValidator,
} from '../../services/wizard-validators';
import { UniversityTypeahead } from '../university-typeahead/university-typeahead';

interface InstitutionForm {
  university: FormControl<University | null>;
  faculty: FormControl<string>;
  domain: FormControl<string>;
  website: FormControl<string>;
}

@Component({
  selector: 'app-wizard-step-institution',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, UniversityTypeahead],
  templateUrl: './wizard-step-institution.html',
})
export class WizardStepInstitution {
  private readonly state = inject(WizardStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly cycle = input.required<Cycle>();

  protected readonly copy = computed<Step3Copy>(() => step3CopyFor(this.cycle()));
  protected readonly domainOptions = computed<readonly string[]>(() =>
    domainOptionsFor(this.cycle()),
  );

  protected readonly form = this.fb.group<InstitutionForm>({
    university: this.fb.control<University | null>(null, [selectedUniversityValidator]),
    faculty: this.fb.control('', [Validators.required, nonBlankValidator]),
    domain: this.fb.control('', [Validators.required, nonBlankValidator]),
    website: this.fb.control('', [optionalUrlValidator]),
  });

  constructor() {
    const values = this.state.snapshot.values;
    this.form.patchValue(
      {
        university: values.university,
        faculty: values.faculty,
        domain: values.domain,
        website: values.website,
      },
      { emitEvent: false },
    );

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const raw = this.form.getRawValue();
      this.state.patchStep({
        university: raw.university,
        faculty: raw.faculty,
        domain: raw.domain,
        website: raw.website,
      });
    });
  }

  protected get university(): FormControl<University | null> {
    return this.form.controls.university;
  }

  protected get faculty(): FormControl<string> {
    return this.form.controls.faculty;
  }

  protected get domain(): FormControl<string> {
    return this.form.controls.domain;
  }

  protected get website(): FormControl<string> {
    return this.form.controls.website;
  }

  protected onContinue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.goNext();
  }

  protected onBack(): void {
    this.state.goBack();
  }
}
