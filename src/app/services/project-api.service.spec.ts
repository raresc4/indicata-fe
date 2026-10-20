import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProjectApiService } from './project-api.service';
import { ProjectCreateRequest, ProjectResponse } from '../models/project.model';
import { environment } from '../../environments/environment';

const projectsUrl = `${environment.apiBaseUrl}/projects`;

const request: ProjectCreateRequest = {
  user_id: '00000000-0000-0000-0000-000000000000',
  university_id: 'upt',
  faculty: 'Automatică și Calculatoare',
  name: 'Doctorate - UPT - Calculatoare',
  level: 'doctorate',
  program_name: 'Calculatoare',
  university_url: null,
};

describe('ProjectApiService', () => {
  let service: ProjectApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('POSTs the exact payload to the projects endpoint and passes a 201 body through', () => {
    const response: ProjectResponse = {
      id: '11111111-1111-1111-1111-111111111111',
      user_id: request.user_id,
      university_id: request.university_id,
      faculty: request.faculty,
      name: request.name,
      level: request.level,
      program_name: request.program_name,
      university_url: null,
      created_at: '2026-10-13T00:00:00Z',
      updated_at: '2026-10-13T00:00:00Z',
    };

    let received: ProjectResponse | undefined;
    service.createProject(request).subscribe((value) => {
      received = value;
    });

    const req = httpMock.expectOne(projectsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response, { status: 201, statusText: 'Created' });

    expect(received).toEqual(response);
  });

  for (const status of [400, 404, 500]) {
    it(`surfaces a ${status} response as an error to the subscriber`, () => {
      let errorStatus: number | undefined;
      let succeeded = false;
      service.createProject(request).subscribe({
        next: () => {
          succeeded = true;
        },
        error: (error: { status: number }) => {
          errorStatus = error.status;
        },
      });

      const req = httpMock.expectOne(projectsUrl);
      req.flush(
        { error: { code: 'ERR', message: 'nope', details: null } },
        { status, statusText: 'Error' },
      );

      expect(succeeded).toBe(false);
      expect(errorStatus).toBe(status);
    });
  }
});
