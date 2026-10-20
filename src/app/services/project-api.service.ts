import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProjectCreateRequest, ProjectResponse } from '../models/project.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  private readonly projectsUrl = `${environment.apiBaseUrl}/projects`;

  createProject(request: ProjectCreateRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.projectsUrl, request);
  }
}
