import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTabGroup } from '@angular/material/tabs';
import axe from 'axe-core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { stubIndicatorApi } from '../../mocks/indicator-api.stub';
import { IndicatorApiService } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { EvidencePanel } from './evidence-panel';

function cards(fixture: ReturnType<typeof TestBed.createComponent<EvidencePanel>>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('app-source-card'));
}

describe('EvidencePanel', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<EvidencePanel>>;
  let state: IndicatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EvidencePanel],
      providers: [provideHttpClient(), IndicatorStateService],
    });
    stubIndicatorApi(TestBed.inject(IndicatorApiService));
    state = TestBed.inject(IndicatorStateService);
    state.loadTree('project-1');
    state.selectIndicator('A.1.1.1');
    fixture = TestBed.createComponent(EvidencePanel);
    fixture.detectChanges();
  });

  it('renders a card for each source in the fixture', () => {
    expect(cards(fixture).length).toBe(5);
  });

  it('shows the summary counts and the unsourced badge', () => {
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('5 sources · 5 claims linked');
    expect(text).toContain('2 unsourced');
  });

  it('rounds a card selection through state', () => {
    const button = cards(fixture)[1].querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(state.snapshot.selectedSourceId).toBe(2);
  });

  it('reflects the selected source as aria-pressed on the matching card', () => {
    state.selectSource(3);
    fixture.detectChanges();

    const pressed = Array.from(
      fixture.nativeElement.querySelectorAll('app-source-card button[aria-pressed="true"]'),
    ) as HTMLElement[];
    expect(pressed.length).toBe(1);
    expect((pressed[0].textContent ?? '').replace(/\s+/g, ' ')).toContain(
      'Organigrama Instituțională UPT',
    );
  });

  it('appends a source through state when adding a document', () => {
    const before = state.snapshot.sources.length;
    const add = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      ((b as HTMLButtonElement).textContent ?? '').includes('Add document'),
    ) as HTMLButtonElement;
    add.click();
    fixture.detectChanges();

    expect(state.snapshot.sources.length).toBe(before + 1);
    expect(cards(fixture).length).toBe(before + 1);
  });

  it('exposes the tabs with tablist/tab roles', () => {
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).not.toBeNull();
    const tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ) as HTMLElement[];
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('reflects the active evidence tab from state as the selected tab', () => {
    state.setEvidenceTab('versions');
    fixture.detectChanges();

    const tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ) as HTMLElement[];
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
  });

  it('updates the evidence tab in state when the tab group reports a change', () => {
    const group = fixture.debugElement.query(By.directive(MatTabGroup))
      .componentInstance as MatTabGroup;
    group.selectedIndexChange.emit(1);
    fixture.detectChanges();

    expect(state.snapshot.evidenceTab).toBe('versions');
  });

  it('renders a row for each version in the fixture', () => {
    state.setEvidenceTab('versions');
    fixture.detectChanges();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('app-version-row'));
    expect(rows.length).toBe(4);
  });

  it('loads a version into state and marks the matching row active when a row requests load', () => {
    const loadedContent = {
      sections: [
        {
          id: 'section-content',
          heading: '',
          blocks: [{ id: 'block-content', runs: [{ text: 'Older text' }] }],
        },
      ],
    };
    TestBed.inject(IndicatorApiService).getVersion = (_indicatorId: string, versionId: string) =>
      of({ versionId, content: loadedContent });

    state.setEvidenceTab('versions');
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('app-version-row'));
    const secondRow = rows[1].componentInstance as { load: { emit: (id: string) => void } };
    const versionId = state.snapshot.versions[1].id;
    secondRow.load.emit(versionId);
    fixture.detectChanges();

    expect(state.snapshot.activeVersionId).toBe(versionId);
    expect(state.snapshot.content).toEqual(loadedContent);

    const activeButtons = Array.from(
      fixture.nativeElement.querySelectorAll('app-version-row button[aria-pressed="true"]'),
    ) as HTMLElement[];
    expect(activeButtons.some((b) => (b.textContent ?? '').includes('Viewing'))).toBe(true);
  });

  it('keeps the Diff tab disabled until two versions are selected', () => {
    const tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ) as HTMLElement[];
    expect(tabs[2].getAttribute('aria-disabled')).toBe('true');

    state.toggleDiffVersion(4);
    state.toggleDiffVersion(3);
    fixture.detectChanges();

    expect(tabs[2].getAttribute('aria-disabled')).not.toBe('true');
  });

  it('renders a diff for the two selected versions on the Diff tab', () => {
    state.toggleDiffVersion(3);
    state.toggleDiffVersion(4);
    state.setEvidenceTab('diff');
    fixture.detectChanges();

    const diff = fixture.nativeElement.querySelector('app-version-diff-view');
    expect(diff).not.toBeNull();
    const text = (diff.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('Added');
    expect(text).toContain('Removed');
  });

  it('has no detectable accessibility violations', async () => {
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
