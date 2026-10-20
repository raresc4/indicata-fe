import { VersionOrigin } from './indicator-version.model';

export type IndicatorBackendStatus = 'empty' | 'generating' | 'ready' | 'failed';

export interface IndicatorListItemDto {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly position: number;
  readonly status: IndicatorBackendStatus;
}

export interface IndicatorVersionSummaryDto {
  readonly id: string;
  readonly versionNumber: number;
  readonly origin: VersionOrigin;
  readonly createdAt: string;
}

export interface IndicatorVersionCurrentDto {
  readonly id: string;
  readonly versionNumber: number;
  readonly origin: VersionOrigin;
  readonly createdAt: string;
  readonly content: string;
}

export interface IndicatorDetailDto {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly position: number;
  readonly status: IndicatorBackendStatus;
  readonly currentVersion: IndicatorVersionCurrentDto | null;
  readonly versions: readonly IndicatorVersionSummaryDto[];
}

export interface RawIndicatorVersionSummary {
  readonly id: string;
  readonly version_number: number;
  readonly origin: VersionOrigin;
  readonly created_at: string;
}

export interface RawIndicatorVersionCurrent {
  readonly id: string;
  readonly version_number: number;
  readonly origin: VersionOrigin;
  readonly created_at: string;
  readonly content: string;
}

export interface RawIndicatorDetail {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly position: number;
  readonly status: IndicatorBackendStatus;
  readonly current_version: RawIndicatorVersionCurrent | null;
  readonly versions: readonly RawIndicatorVersionSummary[];
}
