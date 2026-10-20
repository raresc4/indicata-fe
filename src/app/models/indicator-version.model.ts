export type VersionOrigin = 'generated' | 'edited' | 'unified';

export interface IndicatorVersion {
  readonly id: string;
  readonly versionNumber: number;
  readonly origin: VersionOrigin;
  readonly createdAt: string;
}
