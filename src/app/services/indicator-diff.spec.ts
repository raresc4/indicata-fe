import { describe, expect, it } from 'vitest';

import { diffLines } from './indicator-diff';

describe('diffLines', () => {
  it('marks every line unchanged for identical input', () => {
    const segments = diffLines('alpha\nbeta', 'alpha\nbeta');
    expect(segments).toEqual([
      { kind: 'unchanged', text: 'alpha' },
      { kind: 'unchanged', text: 'beta' },
    ]);
  });

  it('detects an added trailing line', () => {
    const segments = diffLines('alpha', 'alpha\nbeta');
    expect(segments).toEqual([
      { kind: 'unchanged', text: 'alpha' },
      { kind: 'added', text: 'beta' },
    ]);
  });

  it('detects a removed line', () => {
    const segments = diffLines('alpha\nbeta', 'alpha');
    expect(segments).toEqual([
      { kind: 'unchanged', text: 'alpha' },
      { kind: 'removed', text: 'beta' },
    ]);
  });

  it('renders a replaced line as a removal followed by an addition', () => {
    const segments = diffLines('alpha\nold line\ngamma', 'alpha\nnew line\ngamma');
    expect(segments).toEqual([
      { kind: 'unchanged', text: 'alpha' },
      { kind: 'removed', text: 'old line' },
      { kind: 'added', text: 'new line' },
      { kind: 'unchanged', text: 'gamma' },
    ]);
  });

  it('ignores blank lines and surrounding whitespace', () => {
    const segments = diffLines('  alpha  \n\n', 'alpha');
    expect(segments).toEqual([{ kind: 'unchanged', text: 'alpha' }]);
  });

  it('preserves the added lines unique to the target version', () => {
    const segments = diffLines('a\nb\nc', 'a\nx\nc');
    const added = segments.filter((segment) => segment.kind === 'added').map((s) => s.text);
    const removed = segments.filter((segment) => segment.kind === 'removed').map((s) => s.text);
    expect(added).toEqual(['x']);
    expect(removed).toEqual(['b']);
  });
});
