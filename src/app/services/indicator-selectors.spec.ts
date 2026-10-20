import { describe, expect, it } from 'vitest';

import { IndicatorContent } from '../models/indicator-content.model';
import { INDICATOR_CONTENT_SOURCED } from '../mocks/indicator-content-states.mock';
import { INDICATOR_A111_CONTENT } from '../mocks/indicator-a111.mock';
import { INDICATORS_TREE } from '../mocks/indicators-tree.mock';
import { progress, unsourcedCount, viewTokenFor } from './indicator-selectors';

describe('viewTokenFor', () => {
  it('maps generating status to the generating token', () => {
    expect(viewTokenFor('generating')).toBe('generating');
  });

  it('maps ready status to the draft token', () => {
    expect(viewTokenFor('ready')).toBe('draft');
  });

  it('falls back to empty for empty and failed statuses', () => {
    expect(viewTokenFor('empty')).toBe('empty');
    expect(viewTokenFor('failed')).toBe('empty');
  });
});

describe('unsourcedCount', () => {
  it('returns zero for null content', () => {
    expect(unsourcedCount(null)).toBe(0);
  });

  it('returns zero when no runs are marked unsourced', () => {
    expect(unsourcedCount(INDICATOR_CONTENT_SOURCED)).toBe(0);
  });

  it('counts each run marked unsourced in the populated fixture', () => {
    expect(unsourcedCount(INDICATOR_A111_CONTENT)).toBe(2);
  });
});

describe('progress', () => {
  it('returns zeros for an empty tree', () => {
    expect(progress([])).toEqual({ reviewed: 0, total: 0, ratio: 0 });
  });

  it('counts reviewed rows over total rows in the fixture', () => {
    const result = progress(INDICATORS_TREE);
    expect(result.total).toBe(39);
    expect(result.reviewed).toBe(19);
    expect(result.ratio).toBeCloseTo(19 / 39);
  });

  it('never divides by zero', () => {
    const content: IndicatorContent = { sections: [] };
    expect(content.sections.length).toBe(0);
    expect(progress([]).ratio).toBe(0);
  });
});
