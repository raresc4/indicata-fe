import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthLayout } from './auth-layout';

@Component({
  imports: [AuthLayout],
  template: `<app-auth-layout><p data-testid="projected">Projected content</p></app-auth-layout>`,
})
class AuthLayoutHost {}

describe('AuthLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayout, AuthLayoutHost],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AuthLayout);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the header, main, and footer chrome', async () => {
    const fixture = TestBed.createComponent(AuthLayout);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('header')).not.toBeNull();
    expect(element.querySelector('main')).not.toBeNull();
    expect(element.querySelector('footer')).not.toBeNull();
  });

  it('should route the logo link to /login', async () => {
    const fixture = TestBed.createComponent(AuthLayout);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const logo = element.querySelector<HTMLAnchorElement>('header a');
    expect(logo?.getAttribute('href')).toBe('/login');
  });

  it('should project content inside the card wrapper', async () => {
    const fixture = TestBed.createComponent(AuthLayoutHost);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.paper-card');
    const projected = element.querySelector('[data-testid="projected"]');
    expect(card).not.toBeNull();
    expect(projected).not.toBeNull();
    expect(card?.contains(projected)).toBe(true);
  });
});
