import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { RegisterPage } from './register-page';

interface RegisterPageInternals {
  form: FormGroup;
}

function getForm(component: unknown): FormGroup {
  return (component as RegisterPageInternals).form;
}

describe('RegisterPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be invalid when the form is empty', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    expect(getForm(fixture.componentInstance).invalid).toBe(true);
  });

  it('should flag an invalid email', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const form = getForm(fixture.componentInstance);
    form.controls['email'].setValue('not-an-email');
    expect(form.controls['email'].hasError('email')).toBe(true);
  });

  it('should require at least 8 characters for the password', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const form = getForm(fixture.componentInstance);
    form.controls['password'].setValue('short');
    expect(form.controls['password'].hasError('minlength')).toBe(true);
  });

  it('should set a group-level error when passwords do not match', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const form = getForm(fixture.componentInstance);
    form.controls['password'].setValue('correct-horse');
    form.controls['confirmPassword'].setValue('battery-staple');
    expect(form.hasError('passwordMismatch')).toBe(true);
  });

  it('should clear the mismatch error when passwords match', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const form = getForm(fixture.componentInstance);
    form.controls['password'].setValue('correct-horse');
    form.controls['confirmPassword'].setValue('correct-horse');
    expect(form.hasError('passwordMismatch')).toBe(false);
  });

  it('should require the terms checkbox to be accepted', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const form = getForm(fixture.componentInstance);
    form.setValue({
      fullName: 'Prof. Elena Dumitrescu',
      email: 'e.dumitrescu@unibuc.ro',
      institution: 'Universitatea din București',
      password: 'correct-horse-battery',
      confirmPassword: 'correct-horse-battery',
      terms: false,
    });
    expect(form.controls['terms'].hasError('required')).toBe(true);
    expect(form.valid).toBe(false);

    form.controls['terms'].setValue(true);
    expect(form.valid).toBe(true);
  });

  it('should mark controls touched on invalid submit', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const component = fixture.componentInstance as unknown as {
      onSubmit(): void;
    } & RegisterPageInternals;
    component.onSubmit();
    expect(getForm(component).touched).toBe(true);
  });

  it('should render validation errors on invalid submit', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLFormElement>('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(element.querySelector('#fullName-error')).not.toBeNull();
    expect(element.querySelector('#email-error')).not.toBeNull();
    expect(element.querySelector('#institution-error')).not.toBeNull();
    expect(element.querySelector('#password-error')).not.toBeNull();
    expect(element.querySelector('#confirmPassword-error')).not.toBeNull();
    expect(element.querySelector('#terms-error')).not.toBeNull();
  });

  it('should surface a password-mismatch error when confirm differs', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    await fixture.whenStable();
    const form = getForm(fixture.componentInstance);
    form.controls['password'].setValue('correct-horse-1');
    form.controls['confirmPassword'].setValue('battery-staple-2');
    form.controls['confirmPassword'].markAsTouched();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#confirmPassword-error')?.textContent).toContain(
      'Passwords do not match',
    );
  });

  it('should move the strength bar as the password gets stronger', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    await fixture.whenStable();
    const form = getForm(fixture.componentInstance);
    const element = fixture.nativeElement as HTMLElement;

    const countFilled = (): number =>
      element.querySelectorAll('.grid.grid-cols-4 > .bg-primary').length;

    form.controls['password'].setValue('aaa');
    await fixture.whenStable();
    const weakFilled = countFilled();

    form.controls['password'].setValue('7hunder-Oak!Marble_92z');
    await fixture.whenStable();
    const strongFilled = countFilled();

    expect(strongFilled).toBeGreaterThan(weakFilled);
  });

  it('should route the sign-in link to /login', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const signIn = Array.from(element.querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === 'Sign in',
    );
    expect(signIn?.getAttribute('href')).toBe('/login');
  });
});
