import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { IndicatorSource } from '../models/indicator-source.model';
import { INDICATOR_A111_SOURCES } from '../mocks/indicator-a111.mock';

export interface AddSourceRequest {
  readonly documentTitle: string;
  readonly provenance: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private readonly http = inject(HttpClient);
  private readonly indicatorsUrl = `${environment.apiBaseUrl}/indicators`;

  getSources(code: string): Observable<readonly IndicatorSource[]> {
    return this.mock(`${this.indicatorsUrl}/${code}/sources`, INDICATOR_A111_SOURCES);
  }

  addSource(code: string, request: AddSourceRequest): Observable<IndicatorSource> {
    const nextRef = INDICATOR_A111_SOURCES.length + 1;
    return this.mock<IndicatorSource>(`${this.indicatorsUrl}/${code}/sources`, {
      ref: nextRef,
      documentTitle: request.documentTitle,
      sourceType: 'upload',
      provenance: request.provenance,
      documentId: `doc-${nextRef}`,
    });
  }

  private endpoint(url: string): string {
    return url;
  }

  private mock<T>(url: string, value: T): Observable<T> {
    this.endpoint(url);
    return of(value);
  }
}
