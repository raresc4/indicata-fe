import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { environment } from '../../environments/environment';
import {
  IndicatorListItemDto,
  RawIndicatorDetail,
  RawIndicatorVersionCurrent,
} from '../models/indicator-api.model';
import { IndicatorDetail, IndicatorApiService, LoadedVersion } from './indicator-api.service';
import { IndicatorDomain } from '../models/indicator-tree.model';
import { contentStringToIndicatorContent } from './indicator-api.mapper';

describe('IndicatorApiService read endpoints', () => {
  let api: IndicatorApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), IndicatorApiService],
    });
    api = TestBed.inject(IndicatorApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the project list and maps it into a nested tree', () => {
    const list: readonly IndicatorListItemDto[] = [
      { id: 'id-a111', code: 'A.1.1.1', title: 'First', position: 1, status: 'ready' },
      { id: 'id-a112', code: 'A.1.1.2', title: 'Second', position: 2, status: 'empty' },
    ];

    let tree: readonly IndicatorDomain[] | undefined;
    api.getTree('project-123').subscribe((value) => {
      tree = value;
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/indicators/fromProjectId/project-123`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(list);

    expect(tree).toBeDefined();
    expect(tree?.length).toBe(1);
    expect(tree?.[0].id).toBe('domain-a');
    expect(tree?.[0].criteria[0].indicators.map((row) => row.code)).toEqual(['A.1.1.1', 'A.1.1.2']);
    expect(tree?.[0].criteria[0].indicators[0].status).toBe('draft');
  });

  it('fetches a detail by id and maps snake_case into plain-text content', () => {
    const raw: RawIndicatorDetail = {
      id: 'id-a111',
      code: 'A.1.1.1',
      title: 'First',
      position: 1,
      status: 'ready',
      current_version: {
        id: 'ver-1',
        version_number: 1,
        origin: 'generated',
        created_at: '2026-01-01T00:00:00Z',
        content: 'Backend text',
      },
      versions: [
        {
          id: 'ver-1',
          version_number: 1,
          origin: 'generated',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    };

    let detail: IndicatorDetail | undefined;
    api.getIndicatorDetail('id-a111').subscribe((value) => {
      detail = value;
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/indicators/id-a111`);
    expect(req.request.method).toBe('GET');
    req.flush(raw);

    expect(detail?.indicator.code).toBe('A.1.1.1');
    expect(detail?.content.sections[0].blocks[0].runs[0].text).toBe('Backend text');
    expect(detail?.versions[0].versionNumber).toBe(1);
    expect(detail?.sources).toEqual([]);
  });

  it('saves a version via PUT with the serialized content and maps the response', () => {
    const content = contentStringToIndicatorContent('Edited text');
    const raw: RawIndicatorDetail = {
      id: 'id-a111',
      code: 'A.1.1.1',
      title: 'First',
      position: 1,
      status: 'ready',
      current_version: {
        id: 'ver-3',
        version_number: 3,
        origin: 'edited',
        created_at: '2026-02-02T00:00:00Z',
        content: 'Edited text',
      },
      versions: [
        { id: 'ver-3', version_number: 3, origin: 'edited', created_at: '2026-02-02T00:00:00Z' },
      ],
    };

    let detail: IndicatorDetail | undefined;
    api.saveVersion('id-a111', 'ver-3', content).subscribe((value) => {
      detail = value;
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/indicators/id-a111/versions/ver-3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ content: 'Edited text' });
    req.flush(raw);

    expect(detail?.currentVersionId).toBe('ver-3');
    expect(detail?.content.sections[0].blocks[0].runs[0].text).toBe('Edited text');
  });

  it('fetches a single version and maps its content into editor content', () => {
    const raw: RawIndicatorVersionCurrent = {
      id: 'ver-3',
      version_number: 3,
      origin: 'edited',
      created_at: '2026-02-02T00:00:00Z',
      content: 'Version three text',
    };

    let loaded: LoadedVersion | undefined;
    api.getVersion('id-a111', 'ver-3').subscribe((value) => {
      loaded = value;
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/indicators/id-a111/versions/ver-3`);
    expect(req.request.method).toBe('GET');
    req.flush(raw);

    expect(loaded?.versionId).toBe('ver-3');
    expect(loaded?.content.sections[0].blocks[0].runs[0].text).toBe('Version three text');
  });
});
