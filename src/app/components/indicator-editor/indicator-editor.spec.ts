import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { of, throwError } from 'rxjs';

import { INDICATOR_A111_CONTENT, INDICATOR_A111_VERSIONS } from '../../mocks/indicator-a111.mock';
import {
  INDICATOR_CONTENT_EMPTY,
  INDICATOR_CONTENT_GENERATING,
  INDICATOR_CONTENT_SOURCED,
} from '../../mocks/indicator-content-states.mock';
import { stubIndicatorApi } from '../../mocks/indicator-api.stub';
import { Indicator } from '../../models/indicator.model';
import { IndicatorApiService, IndicatorDetail } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorEditor } from './indicator-editor';

const BASE_INDICATOR: Indicator = {
  id: 'ind-test',
  code: 'A.1.1.1',
  title: 'Test indicator title',
  position: 1,
  status: 'ready',
};

function loadDetail(state: IndicatorStateService, detail: IndicatorDetail): void {
  const api = TestBed.inject(IndicatorApiService);
  api.getIndicatorDetail = () => of(detail);
  api.getIndicator = () => of(detail);
  state.selectIndicator(detail.indicator.code);
}

function render(): ReturnType<typeof TestBed.createComponent<IndicatorEditor>> {
  const fixture = TestBed.createComponent(IndicatorEditor);
  fixture.detectChanges();
  return fixture;
}

describe('IndicatorEditor', () => {
  let state: IndicatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorEditor],
      providers: [provideHttpClient(), IndicatorStateService],
    });
    stubIndicatorApi(TestBed.inject(IndicatorApiService));
    state = TestBed.inject(IndicatorStateService);
    state.loadTree('project-1');
  });

  it('renders the empty view when the indicator has no content', () => {
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'empty' },
      content: INDICATOR_CONTENT_EMPTY,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    expect(fixture.nativeElement.querySelector('app-indicator-empty-view')).not.toBeNull();
  });

  it('renders the generating view while synthesizing', () => {
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'generating' },
      content: INDICATOR_CONTENT_GENERATING,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    expect(fixture.nativeElement.querySelector('app-indicator-generating-view')).not.toBeNull();
  });

  it('renders the draft view when ready with marked content', () => {
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'ready' },
      content: INDICATOR_A111_CONTENT,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    expect(fixture.nativeElement.querySelector('app-indicator-draft-view')).not.toBeNull();
  });

  it('renders the draft view for fully-sourced content', () => {
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'ready' },
      content: INDICATOR_CONTENT_SOURCED,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    expect(fixture.nativeElement.querySelector('app-indicator-draft-view')).not.toBeNull();
  });

  it('falls back to the empty view when content is null', () => {
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'ready' },
      content: null as never,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    expect(fixture.nativeElement.querySelector('app-indicator-empty-view')).not.toBeNull();
  });

  it('surfaces an inline alert when autosave fails and retries on demand', () => {
    const api = TestBed.inject(IndicatorApiService);
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'ready' },
      content: INDICATOR_A111_CONTENT,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();

    let shouldFail = true;
    api.autosave = () =>
      shouldFail ? throwError(() => new Error('offline')) : of(INDICATOR_A111_VERSIONS[0]);
    state.applyEdit(INDICATOR_A111_CONTENT);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement | null;
    expect(alert).not.toBeNull();

    shouldFail = false;
    const retry = alert?.querySelector('button') as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('has no detectable accessibility violations', async () => {
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'ready' },
      content: INDICATOR_A111_CONTENT,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no detectable accessibility violations for the inline save error', async () => {
    const api = TestBed.inject(IndicatorApiService);
    loadDetail(state, {
      indicator: { ...BASE_INDICATOR, status: 'ready' },
      content: INDICATOR_A111_CONTENT,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = render();
    api.autosave = () => throwError(() => new Error('offline'));
    state.applyEdit(INDICATOR_A111_CONTENT);
    fixture.detectChanges();
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
