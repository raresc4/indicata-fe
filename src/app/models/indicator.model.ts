export type IndicatorStatus = 'empty' | 'generating' | 'ready' | 'failed';

export type IndicatorTreeStatus = 'empty' | 'draft' | 'review';

export interface Indicator {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly position: number;
  readonly status: IndicatorStatus;
}
