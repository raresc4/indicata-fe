import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { IndicatorTreeStatus } from '../models/indicator.model';
import { INDICATORS_TREE } from '../mocks/indicators-tree.mock';
import { adjacentCode, filterTree, flattenRows } from './indicator-selectors';

const statusArb: fc.Arbitrary<IndicatorTreeStatus> = fc.constantFrom<IndicatorTreeStatus>(
  'empty',
  'draft',
  'review',
);

const allCodes = flattenRows(INDICATORS_TREE).map((row) => row.code);

const queryArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.constant('a.1'),
  fc.constant('doctoral'),
  fc.constant('zzz-no-match'),
  fc.string(),
);

const statusesArb: fc.Arbitrary<readonly IndicatorTreeStatus[]> = fc.uniqueArray(statusArb, {
  maxLength: 4,
});

describe('indicator-selectors filterTree property', () => {
  it('Feature: indicators-page, Property 1: For all queries and status filters, every row in the filtered tree exists in the original tree (the result is a subset) and matches both the case-insensitive substring and status filter', () => {
    const originalCodes = new Set(allCodes);
    fc.assert(
      fc.property(queryArb, statusesArb, (query, statuses) => {
        const filtered = filterTree(INDICATORS_TREE, query, statuses);
        const needle = query.trim().toLowerCase();
        for (const row of flattenRows(filtered)) {
          expect(originalCodes.has(row.code)).toBe(true);
          if (statuses.length > 0) {
            expect(statuses.includes(row.status)).toBe(true);
          }
          if (needle.length > 0) {
            const haystack = `${row.code} ${row.title}`.toLowerCase();
            expect(haystack.includes(needle)).toBe(true);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

const codeArb: fc.Arbitrary<string> = fc.constantFrom<string>(...allCodes);

describe('indicator-selectors adjacentCode property', () => {
  it('Feature: indicators-page, Property 2: For all indicator codes, adjacentCode is a consistent total order over flattened rows: the first row has no prev and the last has no next, and in the interior prev(next(code)) and next(prev(code)) return the original code', () => {
    fc.assert(
      fc.property(codeArb, (code) => {
        const index = allCodes.indexOf(code);
        const isFirst = index === 0;
        const isLast = index === allCodes.length - 1;

        const prev = adjacentCode(INDICATORS_TREE, code, 'prev');
        const next = adjacentCode(INDICATORS_TREE, code, 'next');

        if (isFirst) {
          expect(prev).toBeNull();
        } else {
          expect(prev).toBe(allCodes[index - 1]);
          expect(adjacentCode(INDICATORS_TREE, prev as string, 'next')).toBe(code);
        }

        if (isLast) {
          expect(next).toBeNull();
        } else {
          expect(next).toBe(allCodes[index + 1]);
          expect(adjacentCode(INDICATORS_TREE, next as string, 'prev')).toBe(code);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Feature: indicators-page, Property 3: For all codes not present in the tree, adjacentCode returns null in both directions', () => {
    const present = new Set(allCodes);
    fc.assert(
      fc.property(
        fc.string().filter((value) => !present.has(value)),
        (code) => {
          expect(adjacentCode(INDICATORS_TREE, code, 'prev')).toBeNull();
          expect(adjacentCode(INDICATORS_TREE, code, 'next')).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });
});
