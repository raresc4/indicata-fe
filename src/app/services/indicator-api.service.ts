import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  IndicatorDetailDto,
  IndicatorListItemDto,
  RawIndicatorDetail,
  RawIndicatorVersionCurrent,
} from '../models/indicator-api.model';
import { IndicatorContent } from '../models/indicator-content.model';
import { IndicatorSource } from '../models/indicator-source.model';
import { IndicatorDomain } from '../models/indicator-tree.model';
import { IndicatorVersion } from '../models/indicator-version.model';
import { Indicator } from '../models/indicator.model';
import {
  INDICATOR_A111,
  INDICATOR_A111_CONTENT,
  INDICATOR_A111_SOURCES,
  INDICATOR_A111_VERSIONS,
} from '../mocks/indicator-a111.mock';
import { INDICATOR_A111_VERSION_CONTENTS } from '../mocks/indicator-a111-version-contents.mock';
import { diffLines } from './indicator-diff';
import {
  buildIndicatorTree,
  contentStringToIndicatorContent,
  mapIndicatorDetail,
} from './indicator-api.mapper';

export interface IndicatorDetail {
  readonly indicator: Indicator;
  readonly content: IndicatorContent;
  readonly sources: readonly IndicatorSource[];
  readonly versions: readonly IndicatorVersion[];
  readonly currentVersionId: string | null;
  readonly currentVersionContent: IndicatorContent | null;
}

export interface LoadedVersion {
  readonly versionId: string;
  readonly content: IndicatorContent;
}

export interface VersionDiffSegment {
  readonly kind: 'added' | 'removed' | 'unchanged';
  readonly text: string;
}

export interface VersionDiff {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly segments: readonly VersionDiffSegment[];
}

@Injectable({ providedIn: 'root' })
export class IndicatorApiService {
  private readonly http = inject(HttpClient);
  private readonly indicatorsUrl = `${environment.apiBaseUrl}/indicators`;

  getProjectIndicators(projectId: string): Observable<readonly IndicatorListItemDto[]> {
    return this.http.get<readonly IndicatorListItemDto[]>(
      `${this.indicatorsUrl}/fromProjectId/${projectId}`,
    );
  }

  getTree(projectId: string): Observable<readonly IndicatorDomain[]> {
    return this.getProjectIndicators(projectId).pipe(map(buildIndicatorTree));
  }

  getIndicatorDetail(indicatorId: string): Observable<IndicatorDetail> {
    return this.http
      .get<RawIndicatorDetail>(`${this.indicatorsUrl}/${indicatorId}`)
      .pipe(map(toIndicatorDetailDto), map(mapIndicatorDetail));
  }

  getVersion(indicatorId: string, versionId: string): Observable<LoadedVersion> {
    return this.http
      .get<RawIndicatorVersionCurrent>(`${this.indicatorsUrl}/${indicatorId}/versions/${versionId}`)
      .pipe(
        map((raw) => ({
          versionId: raw.id,
          content: contentStringToIndicatorContent(raw.content),
        })),
      );
  }

  getIndicator(code: string): Observable<IndicatorDetail> {
    return this.mock(`${this.indicatorsUrl}/${code}`, {
      indicator: INDICATOR_A111,
      content: INDICATOR_A111_CONTENT,
      sources: INDICATOR_A111_SOURCES,
      versions: INDICATOR_A111_VERSIONS,
      currentVersionId: INDICATOR_A111_VERSIONS[0]?.id ?? null,
      currentVersionContent: INDICATOR_A111_CONTENT,
    });
  }

  autosave(code: string, content: IndicatorContent): Observable<IndicatorVersion> {
    const latest = INDICATOR_A111_VERSIONS[0];
    return this.mock(`${this.indicatorsUrl}/${code}`, {
      ...latest,
      origin: content.sections.length > 0 ? 'edited' : latest.origin,
    });
  }

  generate(indicatorId: string): Observable<IndicatorDetail> {
    return this.http
      .post<RawIndicatorDetail>(`${this.indicatorsUrl}/${indicatorId}/generate`, null)
      .pipe(map(toIndicatorDetailDto), map(mapIndicatorDetail));
  }

  rewrite(code: string, selection: string): Observable<string> {
    return this.mock(`${this.indicatorsUrl}/${code}/rewrite`, selection);
  }

  getVersions(code: string): Observable<readonly IndicatorVersion[]> {
    return this.mock(`${this.indicatorsUrl}/${code}/versions`, INDICATOR_A111_VERSIONS);
  }

  getDiff(code: string, fromVersion: number, toVersion: number): Observable<VersionDiff> {
    const fromText = INDICATOR_A111_VERSION_CONTENTS[fromVersion] ?? '';
    const toText = INDICATOR_A111_VERSION_CONTENTS[toVersion] ?? '';
    return this.mock<VersionDiff>(`${this.indicatorsUrl}/${code}/diff`, {
      fromVersion,
      toVersion,
      segments: diffLines(fromText, toText),
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

function toIndicatorDetailDto(raw: RawIndicatorDetail): IndicatorDetailDto {
  return {
    id: raw.id,
    code: raw.code,
    title: raw.title,
    position: raw.position,
    status: raw.status,
    currentVersion:
      raw.current_version === null
        ? null
        : {
            id: raw.current_version.id,
            versionNumber: raw.current_version.version_number,
            origin: raw.current_version.origin,
            createdAt: raw.current_version.created_at,
            content: raw.current_version.content,
          },
    versions: raw.versions.map((version) => ({
      id: version.id,
      versionNumber: version.version_number,
      origin: version.origin,
      createdAt: version.created_at,
    })),
  };
}
