import { IndicatorContent } from './indicator-content.model';
import { IndicatorSource } from './indicator-source.model';
import { IndicatorDomain } from './indicator-tree.model';
import { IndicatorVersion } from './indicator-version.model';
import { Indicator, IndicatorTreeStatus } from './indicator.model';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type EvidenceTab = 'sources' | 'versions' | 'diff';

export interface IndicatorScreenState {
  readonly tree: readonly IndicatorDomain[];
  readonly expandedDomainIds: readonly string[];
  readonly filterQuery: string;
  readonly filterStatuses: readonly IndicatorTreeStatus[];
  readonly activeIndicator: Indicator | null;
  readonly activeVersionId: string | null;
  readonly currentVersionId: string | null;
  readonly currentVersionContent: IndicatorContent | null;
  readonly content: IndicatorContent | null;
  readonly sources: readonly IndicatorSource[];
  readonly versions: readonly IndicatorVersion[];
  readonly selectedSourceId: number | null;
  readonly evidenceTab: EvidenceTab;
  readonly diffSelection: readonly number[];
  readonly saveStatus: SaveStatus;
}
