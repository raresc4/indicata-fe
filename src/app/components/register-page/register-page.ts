import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { AuthLayout } from '../auth-layout/auth-layout';
import {
  PasswordStrengthService,
  type PasswordStrengthResult,
} from '../../services/password-strength.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly passwordStrength = inject(PasswordStrengthService);

  protected readonly passwordVisible = signal(false);
  protected readonly confirmPasswordVisible = signal(false);

  protected readonly passwordInputType = computed(() =>
    this.passwordVisible() ? 'text' : 'password',
  );

  protected readonly confirmPasswordInputType = computed(() =>
    this.confirmPasswordVisible() ? 'text' : 'password',
  );

  protected readonly form = this.fb.group(
    {
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      institution: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  protected readonly strength = toSignal(
    this.password.valueChanges.pipe(startWith(this.password.value), takeUntilDestroyed()),
    { initialValue: this.password.value },
  );

  protected readonly strengthResult = computed<PasswordStrengthResult>(() =>
    this.passwordStrength.evaluate(this.strength()),
  );

  protected readonly strengthTicks = computed<readonly boolean[]>(() => {
    const score = this.strengthResult().score;
    return [score >= 1, score >= 2, score >= 3, score >= 4];
  });

  protected get fullName(): FormControl<string> {
    return this.form.controls.fullName;
  }

  protected get email(): FormControl<string> {
    return this.form.controls.email;
  }

  protected get institution(): FormControl<string> {
    return this.form.controls.institution;
  }

  protected get password(): FormControl<string> {
    return this.form.controls.password;
  }

  protected get confirmPassword(): FormControl<string> {
    return this.form.controls.confirmPassword;
  }

  protected get terms(): FormControl<boolean> {
    return this.form.controls.terms;
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
