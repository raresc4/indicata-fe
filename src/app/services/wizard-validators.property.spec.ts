import { FormControl } from '@angular/forms';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { University } from '../models/university.model';
import { UNIVERSITIES } from '../mocks/universities.mock';
import {
  filterUniversities,
  isNonBlank,
  isSelectedUniversity,
  isValidOptionalUrl,
  nonBlankValidator,
  optionalUrlValidator,
  selectedUniversityValidator,
} from './wizard-validators';

const universityArbitrary: fc.Arbitrary<University> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 6 }),
  name: fc.string({ maxLength: 40 }),
  city: fc.string({ maxLength: 20 }),
  county: fc.string({ maxLength: 20 }),
  acronym: fc.string({ maxLength: 10 }),
});

const universityListArbitrary: fc.Arbitrary<readonly University[]> = fc.uniqueArray(
  universityArbitrary,
  { maxLength: 12, selector: (option) => option.id },
);

const queryArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.string({ maxLength: 10 }),
  fc.constantFrom('', ' ', '   ', '\t', '\n'),
  fc.constantFrom('Universitatea', 'universitatea', 'TIMIȘOARA', 'cluj', 'Babeș'),
);

const blankStringArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom('', ' ', '   ', '\t', '\n', '\r\n', '  \t  '),
  fc.string({ maxLength: 20 }),
);

const urlStringArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom('', ' ', '   '),
  fc.webUrl(),
  fc.constantFrom(
    'https://example.com',
    'http://sub.domain.ro/path?q=1',
    'ftp://files.example.org',
    'not a url',
    'example.com',
    'http://',
    'www.example.com',
    'https://valid.example/with/path',
    '://missing-scheme',
    'htp://typo.example',
  ),
);

describe('wizard-validators property tests', () => {
  it('Feature: project-setup-wizard, Property 6: University filter returns exactly the case-insensitive substring matches', () => {
    fc.assert(
      fc.property(universityListArbitrary, queryArbitrary, (options, query) => {
        const result = filterUniversities(options, query);
        const normalized = query.trim().toLowerCase();

        if (normalized.length === 0) {
          expect(result).toEqual(options);
          return;
        }

        for (const option of result) {
          expect(option.name.toLowerCase().includes(normalized)).toBe(true);
        }

        const returnedIds = new Set(result.map((option) => option.id));
        for (const option of options) {
          const matches = option.name.toLowerCase().includes(normalized);
          expect(returnedIds.has(option.id)).toBe(matches);
        }

        const anyMatch = options.some((option) => option.name.toLowerCase().includes(normalized));
        if (!anyMatch) {
          expect(result.length).toBe(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Feature: project-setup-wizard, Property 7: University is valid only for a mock selection', () => {
    const candidateArbitrary = fc.oneof(
      fc.constantFrom(...UNIVERSITIES),
      fc.constantFrom(...UNIVERSITIES).map((option) => ({ ...option, id: `${option.id}-x` })),
      universityArbitrary,
      fc.string({ maxLength: 30 }),
      fc.constant(null),
    );

    fc.assert(
      fc.property(candidateArbitrary, (candidate) => {
        const isMockOption =
          candidate !== null &&
          typeof candidate === 'object' &&
          typeof (candidate as Partial<University>).id === 'string' &&
          UNIVERSITIES.some((option) => option.id === (candidate as Partial<University>).id);

        const direct = isSelectedUniversity(candidate);
        expect(direct).toBe(isMockOption);

        const validatorResult = selectedUniversityValidator(new FormControl(candidate));
        expect(validatorResult === null).toBe(isMockOption);
      }),
      { numRuns: 100 },
    );
  });

  it('Feature: project-setup-wizard, Property 8: Required and optional field validators', () => {
    fc.assert(
      fc.property(blankStringArbitrary, urlStringArbitrary, (text, url) => {
        const expectedNonBlank = text.trim().length > 0;
        expect(isNonBlank(text)).toBe(expectedNonBlank);
        expect(nonBlankValidator(new FormControl(text)) === null).toBe(expectedNonBlank);

        let expectedUrl: boolean;
        if (url === '') {
          expectedUrl = true;
        } else {
          try {
            new URL(url);
            expectedUrl = true;
          } catch {
            expectedUrl = false;
          }
        }
        expect(isValidOptionalUrl(url)).toBe(expectedUrl);
        expect(optionalUrlValidator(new FormControl(url)) === null).toBe(expectedUrl);
      }),
      { numRuns: 100 },
    );
  });
});
