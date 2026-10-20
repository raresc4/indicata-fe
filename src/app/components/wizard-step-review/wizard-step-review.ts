import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ApiError, ProjectCreateRequest } from '../../models/project.model';
import { WizardState, WizardStepNumber } from '../../models/wizard-state.model';
import { cycleToLevel } from '../../services/cycle-level.mapper';
import { ProjectApiService } from '../../services/project-api.service';
import { defaultReportName } from '../../services/wizard-reducer';
import { step3CopyFor } from '../../services/wizard-selectors';
import { WizardStateService } from '../../services/wizard-state.service';

interface ReviewRow {
  readonly label: string;
  readonly value: string;
  readonly ownerStep: WizardStepNumber;
}

const PLACEHOLDER_USER_ID = '300acdd3-a10e-4e76-8775-99b46fd98dbd';

@Component({
  selector: 'app-wizard-step-review',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './wizard-step-review.html',
})
export class WizardStepReview {
  private readonly state = inject(WizardStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectApi = inject(ProjectApiService);
  private readonly router = inject(Router);

  protected readonly state$: Observable<WizardState> = this.state.state$;

  protected readonly creating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly reportName = this.fb.control(defaultReportName(this.state.snapshot));

  constructor() {
    this.reportName.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reportName) => {
        this.state.patchStep({ reportName });
      });
    this.state.patchStep({ reportName: this.reportName.value });
  }

  protected rowsFor(state: WizardState): readonly ReviewRow[] {
    const values = state.values;
    return [
      { label: 'Cycle', value: values.cycle, ownerStep: 1 },
      { label: 'University', value: this.universityValue(state), ownerStep: 2 },
      { label: 'Faculty', value: this.textValue(values.faculty), ownerStep: 2 },
      {
        label: step3CopyFor(values.cycle).reviewDomainLabel,
        value: this.textValue(values.domain),
        ownerStep: 2,
      },
      { label: 'Website', value: this.textValue(values.website), ownerStep: 2 },
    ];
  }

  protected edit(step: WizardStepNumber): void {
    this.state.goTo(step);
  }

  protected create(): void {
    if (this.creating()) {
      return;
    }
    const values = this.state.snapshot.values;
    const university = values.university;
    if (university === null) {
      return;
    }

    const website = values.website.trim();
    const request: ProjectCreateRequest = {
      user_id: PLACEHOLDER_USER_ID,
      university_id: university.id,
      faculty: values.faculty,
      name: values.reportName,
      level: cycleToLevel(values.cycle),
      program_name: values.domain,
      university_url: website.length > 0 ? values.website : null,
    };

    this.creating.set(true);
    this.errorMessage.set(null);

    this.projectApi
      .createProject(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this.creating.set(false);
          this.errorMessage.set(this.messageFor(error));
        },
      });
  }

  protected back(): void {
    this.state.goBack();
  }

  private messageFor(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = this.backendMessage(error);
      if (backendMessage !== null) {
        return backendMessage;
      }
      switch (error.status) {
        case 400:
          return 'Please check the form and try again.';
        case 404:
          return 'The selected university or user was not found.';
        case 500:
          return 'Something went wrong on the server. Please try again.';
      }
    }
    return 'Something went wrong. Please try again.';
  }

  private backendMessage(error: HttpErrorResponse): string | null {
    const body = error.error as Partial<ApiError> | null;
    const message = body?.error?.message;
    return typeof message === 'string' && message.trim().length > 0 ? message : null;
  }

  private textValue(value: string): string {
    return value.trim().length > 0 ? value : '—';
  }

  private universityValue(state: WizardState): string {
    const university = state.values.university;
    if (university === null) {
      return '—';
    }
    return `${university.name} (${university.acronym})`;
  }
}
