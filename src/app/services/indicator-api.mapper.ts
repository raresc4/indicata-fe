import { IndicatorContent } from '../models/indicator-content.model';
import {
  IndicatorBackendStatus,
  IndicatorDetailDto,
  IndicatorListItemDto,
} from '../models/indicator-api.model';
import {
  IndicatorCriterion,
  IndicatorDomain,
  IndicatorTreeRow,
} from '../models/indicator-tree.model';
import { IndicatorVersion } from '../models/indicator-version.model';
import { Indicator, IndicatorStatus, IndicatorTreeStatus } from '../models/indicator.model';
import { IndicatorDetail } from './indicator-api.service';

export function backendStatusToTreeStatus(status: IndicatorBackendStatus): IndicatorTreeStatus {
  return status === 'ready' ? 'draft' : 'empty';
}

export function backendStatusToIndicatorStatus(status: IndicatorBackendStatus): IndicatorStatus {
  return status;
}

export function contentStringToIndicatorContent(content: string | null): IndicatorContent {
  if (content === null || content.length === 0) {
    return { sections: [] };
  }
  return {
    sections: [
      {
        id: 'section-content',
        heading: '',
        blocks: [{ id: 'block-content', runs: [{ text: content }] }],
      },
    ],
  };
}

export function codeToIdMap(items: readonly IndicatorListItemDto[]): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const item of items) {
    map.set(item.code, item.id);
  }
  return map;
}

function domainKeyFromCode(code: string): string {
  return code.split('.')[0];
}

function criterionKeyFromCode(code: string): string {
  const segments = code.split('.');
  return segments.slice(0, 2).join('.');
}

interface CriterionBuilder {
  readonly id: string;
  readonly label: string;
  readonly rows: IndicatorTreeRow[];
}

interface DomainBuilder {
  readonly id: string;
  readonly label: string;
  readonly criteria: CriterionBuilder[];
}

export function buildIndicatorTree(
  items: readonly IndicatorListItemDto[],
): readonly IndicatorDomain[] {
  const domains: DomainBuilder[] = [];
  const domainByKey = new Map<string, DomainBuilder>();
  const criterionByKey = new Map<string, CriterionBuilder>();

  for (const item of items) {
    const domainKey = domainKeyFromCode(item.code);
    let domain = domainByKey.get(domainKey);
    if (domain === undefined) {
      domain = {
        id: `domain-${domainKey.toLowerCase()}`,
        label: `Domeniul ${domainKey}`,
        criteria: [],
      };
      domainByKey.set(domainKey, domain);
      domains.push(domain);
    }

    const criterionKey = criterionKeyFromCode(item.code);
    let criterion = criterionByKey.get(criterionKey);
    if (criterion === undefined) {
      criterion = {
        id: `criterion-${criterionKey.toLowerCase().replace('.', '')}`,
        label: `Criteriul ${criterionKey}`,
        rows: [],
      };
      criterionByKey.set(criterionKey, criterion);
      domain.criteria.push(criterion);
    }

    criterion.rows.push({
      code: item.code,
      title: item.title,
      status: backendStatusToTreeStatus(item.status),
    });
  }

  return domains.map((domain) => {
    const criteria: readonly IndicatorCriterion[] = domain.criteria.map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      indicators: criterion.rows,
    }));
    const rows = criteria.flatMap((criterion) => criterion.indicators);
    const reviewed = rows.filter((row) => row.status === 'review').length;
    return {
      id: domain.id,
      label: domain.label,
      reviewed,
      total: rows.length,
      criteria,
    };
  });
}

function mapVersion(summary: IndicatorDetailDto['versions'][number]): IndicatorVersion {
  return {
    id: summary.id,
    versionNumber: summary.versionNumber,
    origin: summary.origin,
    createdAt: summary.createdAt,
  };
}

export function mapIndicatorDetail(dto: IndicatorDetailDto): IndicatorDetail {
  const indicator: Indicator = {
    id: dto.id,
    code: dto.code,
    title: dto.title,
    position: dto.position,
    status: backendStatusToIndicatorStatus(dto.status),
  };
  return {
    indicator,
    content: contentStringToIndicatorContent(dto.currentVersion?.content ?? null),
    sources: [],
    versions: dto.versions.map(mapVersion),
    currentVersionId: dto.currentVersion?.id ?? null,
    currentVersionContent:
      dto.currentVersion === null
        ? null
        : contentStringToIndicatorContent(dto.currentVersion.content),
  };
}
