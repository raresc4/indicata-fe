export type SourceType = 'upload' | 'crawl' | 'search';

export interface IndicatorSource {
  readonly ref: number;
  readonly documentTitle: string;
  readonly sourceType: SourceType;
  readonly page?: number;
  readonly excerpt?: string;
  readonly provenance: string;
  readonly documentId: string;
}
