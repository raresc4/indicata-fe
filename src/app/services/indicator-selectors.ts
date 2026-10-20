import { IndicatorContent } from '../models/indicator-content.model';
import { IndicatorDomain, IndicatorTreeRow } from '../models/indicator-tree.model';
import { IndicatorStatus, IndicatorTreeStatus } from '../models/indicator.model';

export type IndicatorViewToken = 'empty' | 'generating' | 'draft';

export type AdjacentDirection = 'prev' | 'next';

export interface IndicatorProgress {
  readonly reviewed: number;
  readonly total: number;
  readonly ratio: number;
}

export function viewTokenFor(status: IndicatorStatus): IndicatorViewToken {
  switch (status) {
    case 'generating':
      return 'generating';
    case 'ready':
      return 'draft';
    case 'empty':
    case 'failed':
      return 'empty';
    default:
      return 'empty';
  }
}

export function unsourcedCount(content: IndicatorContent | null): number {
  if (content === null) {
    return 0;
  }
  let count = 0;
  for (const section of content.sections) {
    for (const block of section.blocks) {
      for (const run of block.runs) {
        if (run.marks?.some((mark) => mark.type === 'unsourced')) {
          count += 1;
        }
      }
    }
  }
  return count;
}

export function citationCount(content: IndicatorContent | null): number {
  if (content === null) {
    return 0;
  }
  let count = 0;
  for (const section of content.sections) {
    for (const block of section.blocks) {
      for (const run of block.runs) {
        if (run.marks?.some((mark) => mark.type === 'citation')) {
          count += 1;
        }
      }
    }
  }
  return count;
}

export function progress(tree: readonly IndicatorDomain[]): IndicatorProgress {
  const rows = flattenRows(tree);
  const total = rows.length;
  const reviewed = rows.filter((row) => row.status === 'review').length;
  const ratio = total === 0 ? 0 : reviewed / total;
  return { reviewed, total, ratio };
}

export function filterTree(
  tree: readonly IndicatorDomain[],
  query: string,
  statuses: readonly IndicatorTreeStatus[],
): readonly IndicatorDomain[] {
  const needle = query.trim().toLowerCase();
  const result: IndicatorDomain[] = [];
  for (const domain of tree) {
    const criteria = [];
    for (const criterion of domain.criteria) {
      const indicators = criterion.indicators.filter((row) => matchesRow(row, needle, statuses));
      if (indicators.length > 0) {
        criteria.push({ ...criterion, indicators });
      }
    }
    if (criteria.length > 0) {
      result.push({ ...domain, criteria });
    }
  }
  return result;
}

export function adjacentCode(
  tree: readonly IndicatorDomain[],
  code: string,
  direction: AdjacentDirection,
): string | null {
  const rows = flattenRows(tree);
  const index = rows.findIndex((row) => row.code === code);
  if (index === -1) {
    return null;
  }
  const target = direction === 'next' ? index + 1 : index - 1;
  if (target < 0 || target >= rows.length) {
    return null;
  }
  return rows[target].code;
}

export function flattenRows(tree: readonly IndicatorDomain[]): readonly IndicatorTreeRow[] {
  const rows: IndicatorTreeRow[] = [];
  for (const domain of tree) {
    for (const criterion of domain.criteria) {
      for (const row of criterion.indicators) {
        rows.push(row);
      }
    }
  }
  return rows;
}

function matchesRow(
  row: IndicatorTreeRow,
  needle: string,
  statuses: readonly IndicatorTreeStatus[],
): boolean {
  const matchesStatus = statuses.length === 0 || statuses.includes(row.status);
  if (!matchesStatus) {
    return false;
  }
  if (needle.length === 0) {
    return true;
  }
  return row.code.toLowerCase().includes(needle) || row.title.toLowerCase().includes(needle);
}
