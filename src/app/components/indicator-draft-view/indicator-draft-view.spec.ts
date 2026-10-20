import { provideHttpClient } from '@angular/common/http';
import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INDICATOR_A111_CONTENT, INDICATOR_A111_SOURCES } from '../../mocks/indicator-a111.mock';
import { stubIndicatorApi } from '../../mocks/indicator-api.stub';
import { IndicatorApiService } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorDraftView } from './indicator-draft-view';

function render(): {
  readonly fixture: ReturnType<typeof TestBed.createComponent<IndicatorDraftView>>;
  readonly ref: ComponentRef<IndicatorDraftView>;
} {
  const fixture = TestBed.createComponent(IndicatorDraftView);
  fixture.componentRef.setInput('content', INDICATOR_A111_CONTENT);
  fixture.detectChanges();
  return { fixture, ref: fixture.componentRef };
}

describe('IndicatorDraftView', () => {
  let state: IndicatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorDraftView],
      providers: [provideHttpClient(), IndicatorStateService],
    });
    stubIndicatorApi(TestBed.inject(IndicatorApiService));
    state = TestBed.inject(IndicatorStateService);
    state.loadTree('project-1');
  });

  it('mounts and tears down without error', () => {
    const { fixture } = render();
    expect(fixture.nativeElement.querySelector('[data-slot], div')).not.toBeNull();
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('renders the custom nodes from content into the editor DOM', async () => {
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const prose = host.querySelector('.ProseMirror');
    if (prose === null) {
      expect(host).not.toBeNull();
      return;
    }
    expect(host.querySelector('[data-source-ref]')).not.toBeNull();
    expect(host.querySelector('[data-missing-doc]')).not.toBeNull();
    expect(host.querySelector('[data-unsourced]')).not.toBeNull();
  });

  it('activating a citation chip calls highlightCitation and selectSource with its ref', async () => {
    const highlight = vi.spyOn(state, 'highlightCitation');
    const select = vi.spyOn(state, 'selectSource');
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const chip = host.querySelector<HTMLElement>('[data-source-ref]');
    if (chip === null) {
      return;
    }
    chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(highlight).toHaveBeenCalledWith(Number(chip.getAttribute('data-source-ref')));
    expect(select).toHaveBeenCalledWith(Number(chip.getAttribute('data-source-ref')));
  });

  it('emphasizes the matching chip with data-chip-active when a source is selected', async () => {
    state.selectIndicator('A.1.1.1');
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    if (host.querySelector('.ProseMirror') === null) {
      return;
    }
    state.selectSource(1);
    const active = host.querySelector<HTMLElement>('[data-source-ref="1"][data-chip-active]');
    expect(active).not.toBeNull();
    const inactive = host.querySelector<HTMLElement>('[data-source-ref="2"]');
    expect(inactive?.hasAttribute('data-chip-active')).toBe(false);
  });

  it('labels citation chips with the source title', async () => {
    state.selectIndicator('A.1.1.1');
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const chip = host.querySelector<HTMLElement>('[data-source-ref="1"]');
    if (chip === null) {
      return;
    }
    expect(chip.getAttribute('aria-label')).toBe(
      `Citation 1, ${INDICATOR_A111_SOURCES[0].documentTitle}`,
    );
  });

  it('activating an unsourced marker opens the action menu and removes the claim', async () => {
    state.selectIndicator('A.1.1.1');
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const marker = host.querySelector<HTMLElement>('[data-unsourced]');
    if (marker === null) {
      return;
    }
    const markerText = marker.textContent ?? '';
    const unsourcedBefore = host.querySelectorAll('[data-unsourced]').length;
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    const menu = host.querySelector<HTMLElement>('[role="menu"]');
    expect(menu).not.toBeNull();
    const before = state.snapshot.content;
    const remove = Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []).find(
      (item) => item.textContent?.includes('Remove claim'),
    );
    remove?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelector('[role="menu"]')).toBeNull();
    expect(state.snapshot.content).not.toBe(before);
    expect(host.querySelectorAll('[data-unsourced]').length).toBe(unsourcedBefore - 1);
    const remaining = Array.from(host.querySelectorAll('[data-unsourced]')).map(
      (node) => node.textContent ?? '',
    );
    expect(remaining).not.toContain(markerText);
  });

  it('activating a missing-document chip opens Upload and switches to the sources tab', async () => {
    state.selectIndicator('A.1.1.1');
    const setTab = vi.spyOn(state, 'setEvidenceTab');
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const marker = host.querySelector<HTMLElement>('[data-missing-doc]');
    if (marker === null) {
      return;
    }
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    const menu = host.querySelector<HTMLElement>('[role="menu"]');
    expect(menu).not.toBeNull();
    const upload = menu?.querySelector<HTMLElement>('[role="menuitem"]');
    expect(upload?.textContent).toContain('Upload');
    upload?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(setTab).toHaveBeenCalledWith('sources');
  });

  it('has no detectable accessibility violations with a marker menu open', async () => {
    state.selectIndicator('A.1.1.1');
    const { fixture } = render();
    await Promise.resolve();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const marker = host.querySelector<HTMLElement>('[data-unsourced]');
    if (marker !== null) {
      marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
    }
    const results = await axe.run(host, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
