import { IndicatorTreeStatus } from './indicator.model';

export interface IndicatorTreeRow {
  readonly code: string;
  readonly title: string;
  readonly status: IndicatorTreeStatus;
}

export interface IndicatorCriterion {
  readonly id: string;
  readonly label: string;
  readonly indicators: readonly IndicatorTreeRow[];
}

export interface IndicatorDomain {
  readonly id: string;
  readonly label: string;
  readonly reviewed: number;
  readonly total: number;
  readonly criteria: readonly IndicatorCriterion[];
}
