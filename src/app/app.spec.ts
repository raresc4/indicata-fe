import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { LoginPage } from './components/login-page/login-page';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the login page at /login', async () => {
    const harness = await RouterTestingHarness.create();
    const activated = await harness.navigateByUrl('/login');
    expect(activated).toBeInstanceOf(LoginPage);
  });

  it('should redirect the empty path to /login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/login');
  });
});
