import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { WizardStepReview } from './wizard-step-review';
import { WizardStateService } from '../../services/wizard-state.service';
import { ProjectCreateRequest } from '../../models/project.model';
import { UNIVERSITIES } from '../../mocks/universities.mock';
import { environment } from '../../../environments/environment';

const projectsUrl = `${environment.apiBaseUrl}/projects`;

interface ReviewInternals {
  create(): void;
  creating(): boolean;
  errorMessage(): string | null;
}

function seedValidState(state: WizardStateService): void {
  state.setCycle('Doctorate');
  state.patchStep({
    university: UNIVERSITIES[0],
    faculty: 'Automatică și Calculatoare',
    domain: 'Calculatoare',
    website: '',
    reportName: 'Doctorate - UPT - Calculatoare',
  });
}

describe('WizardStepReview create flow', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WizardStepReview],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    seedValidState(TestBed.inject(WizardStateService));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends the default report name when the field is left untouched', () => {
    const state = TestBed.inject(WizardStateService);
    state.patchStep({ reportName: '' });

    const fixture = TestBed.createComponent(WizardStepReview);
    const component = fixture.componentInstance as unknown as ReviewInternals;

    component.create();

    const req = httpMock.expectOne(projectsUrl);
    const body = req.request.body as ProjectCreateRequest;
    expect(body.name).toBe('Doctorate - UPT - Calculatoare');

    req.flush({ id: 'x' }, { status: 201, statusText: 'Created' });
  });

  it('POSTs the mapped payload and navigates to /dashboard on 201', () => {
    const fixture = TestBed.createComponent(WizardStepReview);
    const component = fixture.componentInstance as unknown as ReviewInternals;

    component.create();
    expect(component.creating()).toBe(true);

    const req = httpMock.expectOne(projectsUrl);
    expect(req.request.method).toBe('POST');
    const body = req.request.body as ProjectCreateRequest;
    expect(body.user_id).toBe('300acdd3-a10e-4e76-8775-99b46fd98dbd');
    expect(body.university_id).toBe(UNIVERSITIES[0].id);
    expect(body.level).toBe('doctorate');
    expect(body.program_name).toBe('Calculatoare');
    expect(body.name).toBe('Doctorate - UPT - Calculatoare');
    expect(body.university_url).toBeNull();

    req.flush({ id: 'x' }, { status: 201, statusText: 'Created' });

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  for (const [status, expected] of [
    [400, 'Please check the form and try again.'],
    [404, 'The selected university or user was not found.'],
    [500, 'Something went wrong on the server. Please try again.'],
  ] as const) {
    it(`shows a message and re-enables on ${status} without navigating`, () => {
      const fixture = TestBed.createComponent(WizardStepReview);
      const component = fixture.componentInstance as unknown as ReviewInternals;

      component.create();
      const req = httpMock.expectOne(projectsUrl);
      req.flush({}, { status, statusText: 'Error' });

      expect(component.creating()).toBe(false);
      expect(component.errorMessage()).toBe(expected);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  }

  it('prefers the backend error message when present', () => {
    const fixture = TestBed.createComponent(WizardStepReview);
    const component = fixture.componentInstance as unknown as ReviewInternals;

    component.create();
    const req = httpMock.expectOne(projectsUrl);
    req.flush(
      { error: { code: 'NOT_FOUND', message: 'University not found', details: null } },
      { status: 404, statusText: 'Not Found' },
    );

    expect(component.errorMessage()).toBe('University not found');
  });
});
