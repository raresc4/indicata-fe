import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { stubIndicatorApi } from '../../mocks/indicator-api.stub';
import { IndicatorApiService } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorTree } from './indicator-tree';

function rows(fixture: ReturnType<typeof TestBed.createComponent<IndicatorTree>>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('app-indicator-tree-row'));
}

function searchInput(
  fixture: ReturnType<typeof TestBed.createComponent<IndicatorTree>>,
): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
}

describe('IndicatorTree', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<IndicatorTree>>;
  let state: IndicatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorTree],
      providers: [provideHttpClient(), IndicatorStateService],
    });
    stubIndicatorApi(TestBed.inject(IndicatorApiService));
    state = TestBed.inject(IndicatorStateService);
    state.loadTree('project-1');
    state.toggleDomain('domain-a');
    state.toggleDomain('domain-b');
    state.toggleDomain('domain-c');
    fixture = TestBed.createComponent(IndicatorTree);
    fixture.detectChanges();
  });

  it('renders a row for every indicator in the fixture tree', () => {
    expect(rows(fixture).length).toBe(39);
  });

  it('shows the overall progress header derived from the tree', () => {
    expect((fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ')).toContain(
      '0 of 39 reviewed',
    );
  });

  it('narrows rows when typing a query in the search field', () => {
    const input = searchInput(fixture);
    input.value = 'A.1.1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const codes = rows(fixture).map((row) => row.getAttribute('aria-label') ?? '');
    expect(codes.length).toBe(2);
    expect(codes.every((label) => label.startsWith('A.1.1'))).toBe(true);
  });

  it('commands selectIndicator and marks the active row with aria-current', () => {
    const first = rows(fixture)[0];
    first.click();
    fixture.detectChanges();

    expect(state.snapshot.activeIndicator?.code).toBe('A.1.1.1');
    const active = fixture.nativeElement.querySelector(
      'app-indicator-tree-row[aria-current="true"]',
    ) as HTMLElement | null;
    expect(active?.getAttribute('aria-label')).toContain('A.1.1.1');
  });

  it('renders a legend of the three statuses', () => {
    const footer = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(footer).toContain('Empty');
    expect(footer).toContain('Draft');
    expect(footer).toContain('Review');
    expect(footer).not.toContain('Approved');
  });

  it('has no detectable accessibility violations', async () => {
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
