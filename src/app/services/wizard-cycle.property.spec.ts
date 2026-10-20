import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { step3CopyFor } from './wizard-selectors';
import { Cycle } from '../models/cycle.model';
import { DOCTORATE_STEP3_COPY, NON_DOCTORATE_STEP3_COPY } from '../mocks/step3-copy.mock';

const cycleArb: fc.Arbitrary<Cycle> = fc.constantFrom<Cycle>('Bachelor', 'Master', 'Doctorate');

describe('wizard cycle properties', () => {
  it('Feature: project-setup-wizard, Property 9: Cycle controls the domain copy variant', () => {
    fc.assert(
      fc.property(cycleArb, (cycle) => {
        const isDoctorate = cycle === 'Doctorate';
        const copy = step3CopyFor(cycle);
        if (isDoctorate) {
          expect(copy).toEqual(DOCTORATE_STEP3_COPY);
          expect(copy.reviewDomainLabel).toBe('Domain');
        } else {
          expect(copy).toEqual(NON_DOCTORATE_STEP3_COPY);
          expect(copy.reviewDomainLabel).toBe('Programme');
        }
      }),
      { numRuns: 100 },
    );
  });
});
