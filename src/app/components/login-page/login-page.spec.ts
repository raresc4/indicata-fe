import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login-page';

interface LoginPageInternals {
  form: FormGroup;
}

describe('LoginPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LoginPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be invalid when the form is empty', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance as unknown as LoginPageInternals;
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid with a well-formed email and a non-empty password', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance as unknown as LoginPageInternals;
    component.form.setValue({
      email: 'v.popescu@univ.edu.ro',
      password: 'a-secret-value',
      remember: false,
    });
    expect(component.form.valid).toBe(true);
  });

  it('should toggle the password input type and the toggle button state', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const passwordInput = element.querySelector<HTMLInputElement>('#password');
    const toggle = element.querySelector<HTMLButtonElement>('button[aria-label="Show password"]');

    expect(passwordInput?.getAttribute('type')).toBe('password');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');

    toggle?.click();
    await fixture.whenStable();

    expect(passwordInput?.getAttribute('type')).toBe('text');
    expect(
      element.querySelector('button[aria-label="Hide password"]')?.getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('should route the create-account link to /register', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const createAccount = Array.from(element.querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === 'Create an account',
    );
    expect(createAccount?.getAttribute('href')).toBe('/register');
  });

  it('should show validation errors on invalid submit without changing route', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector<HTMLFormElement>('form');

    form?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as LoginPageInternals;
    expect(component.form.touched).toBe(true);
    expect(element.querySelector('#email-error')).not.toBeNull();
    expect(element.querySelector('#password-error')).not.toBeNull();
  });
});
