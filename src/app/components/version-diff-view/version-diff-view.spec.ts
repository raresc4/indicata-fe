import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { VersionDiff } from '../../services/indicator-api.service';
import { VersionDiffView } from './version-diff-view';

const DIFF: VersionDiff = {
  fromVersion: 3,
  toVersion: 4,
  segments: [
    { kind: 'unchanged', text: 'Shared opening statement.' },
    { kind: 'removed', text: 'The old sentence that was dropped.' },
    { kind: 'added', text: 'The new sentence with Senate Resolution no. 84.' },
  ],
};

function create(diff: VersionDiff): ReturnType<typeof TestBed.createComponent<VersionDiffView>> {
  const fixture = TestBed.createComponent(VersionDiffView);
  fixture.componentRef.setInput('diff', diff);
  fixture.detectChanges();
  return fixture;
}

describe('VersionDiffView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [VersionDiffView] });
  });

  it('shows the compared version numbers', () => {
    const fixture = create(DIFF);
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('v3');
    expect(text).toContain('v4');
  });

  it('renders added and removed regions with text markers, not color alone', () => {
    const fixture = create(DIFF);
    const items = Array.from(fixture.nativeElement.querySelectorAll('li')) as HTMLElement[];
    const removed = items.find((li) => (li.textContent ?? '').includes('old sentence'))!;
    const added = items.find((li) => (li.textContent ?? '').includes('new sentence'))!;

    expect((removed.textContent ?? '').replace(/\s+/g, ' ')).toContain('Removed');
    expect((added.textContent ?? '').replace(/\s+/g, ' ')).toContain('Added');
  });

  it('renders a message when there are no differences', () => {
    const fixture = create({ fromVersion: 1, toVersion: 2, segments: [] });
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('No differences');
  });

  it('has no detectable accessibility violations', async () => {
    const fixture = create(DIFF);
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
