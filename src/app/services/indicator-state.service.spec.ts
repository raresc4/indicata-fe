import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';
import { beforeEach, describe, expect, it } from 'vitest';

import { INDICATOR_A111_CONTENT, INDICATOR_A111_VERSIONS } from '../mocks/indicator-a111.mock';
import { IndicatorListItemDto } from '../models/indicator-api.model';
import { IndicatorContent } from '../models/indicator-content.model';
import { Indicator } from '../models/indicator.model';
import { IndicatorApiService, IndicatorDetail } from './indicator-api.service';
import { IndicatorStateService } from './indicator-state.service';

const INDICATOR: Indicator = {
  id: 'ind-test',
  code: 'A.1.1.1',
  title: 'Test indicator title',
  position: 1,
  status: 'empty',
};

const LIST: readonly IndicatorListItemDto[] = [
  { id: 'ind-test', code: 'A.1.1.1', title: 'Test indicator title', position: 1, status: 'empty' },
];

function detailWith(status: Indicator['status'], content: IndicatorContent): IndicatorDetail {
  return {
    indicator: { ...INDICATOR, status },
    content,
    sources: [],
    versions: [],
    currentVersionId: null,
    currentVersionContent: null,
  };
}

function latest<T>(source: Observable<T>): T {
  let value!: T;
  source.pipe(first()).subscribe((emitted) => {
    value = emitted;
  });
  return value;
}

describe('IndicatorStateService generate flow', () => {
  let state: IndicatorStateService;
  let api: IndicatorApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), IndicatorStateService],
    });
    api = TestBed.inject(IndicatorApiService);
    state = TestBed.inject(IndicatorStateService);
    api.getProjectIndicators = () => of(LIST);
    api.getIndicatorDetail = () => of(detailWith('empty', { sections: [] }));
    api.getIndicator = () => of(detailWith('empty', { sections: [] }));
    state.loadProjectIndicators('project-1');
    state.selectIndicator('A.1.1.1');
  });

  it('transitions to generating, then populates the draft from the returned detail', () => {
    const requested: string[] = [];
    api.generate = (indicatorId: string) => {
      requested.push(indicatorId);
      return of(detailWith('ready', INDICATOR_A111_CONTENT));
    };

    const tokens: string[] = [];
    state.viewToken$.subscribe((token) => tokens.push(token));

    state.generate();

    expect(tokens).toContain('generating');
    expect(requested).toEqual(['ind-test']);
    expect(latest(state.viewToken$)).toBe('draft');
    expect(state.snapshot.content).toEqual(INDICATOR_A111_CONTENT);
  });

  it('cancels a prior in-flight request so only the latest run populates', () => {
    const stale = new Subject<IndicatorDetail>();
    let call = 0;
    api.generate = () => {
      call += 1;
      return call === 1 ? stale.asObservable() : of(detailWith('ready', INDICATOR_A111_CONTENT));
    };

    state.generate();
    expect(latest(state.viewToken$)).toBe('generating');

    state.generate();
    expect(latest(state.viewToken$)).toBe('draft');

    stale.next(detailWith('ready', { sections: [] }));
    stale.complete();

    expect(state.snapshot.content).toEqual(INDICATOR_A111_CONTENT);
  });

  it('sets the save status to error when generation fails', () => {
    api.generate = () => throwError(() => new Error('provider down'));

    state.generate();

    expect(latest(state.saveStatus$)).toBe('error');
  });
});

describe('IndicatorStateService autosave errors', () => {
  let state: IndicatorStateService;
  let api: IndicatorApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), IndicatorStateService],
    });
    api = TestBed.inject(IndicatorApiService);
    state = TestBed.inject(IndicatorStateService);
    api.getProjectIndicators = () => of(LIST);
    api.getIndicatorDetail = () => of(detailWith('ready', INDICATOR_A111_CONTENT));
    api.getIndicator = () => of(detailWith('ready', INDICATOR_A111_CONTENT));
    state.loadProjectIndicators('project-1');
    state.selectIndicator('A.1.1.1');
  });

  it('sets the save status to error when autosave fails and recovers on retry', () => {
    api.autosave = () => throwError(() => new Error('offline'));
    state.applyEdit(INDICATOR_A111_CONTENT);
    expect(latest(state.saveStatus$)).toBe('error');

    api.autosave = () => of(INDICATOR_A111_VERSIONS[0]);
    state.applyEdit(INDICATOR_A111_CONTENT);
    expect(latest(state.saveStatus$)).toBe('saved');
  });
});

describe('IndicatorStateService project loading', () => {
  let state: IndicatorStateService;
  let api: IndicatorApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), IndicatorStateService],
    });
    api = TestBed.inject(IndicatorApiService);
    state = TestBed.inject(IndicatorStateService);
  });

  it('loads a project tree and resolves a code to its backend id for detail', () => {
    const requested: string[] = [];
    api.getProjectIndicators = () => of(LIST);
    api.getIndicatorDetail = (id: string) => {
      requested.push(id);
      return of(detailWith('ready', INDICATOR_A111_CONTENT));
    };

    state.loadProjectIndicators('project-1');
    expect(state.snapshot.tree.length).toBe(1);

    state.selectIndicator('A.1.1.1');
    expect(requested).toEqual(['ind-test']);
    expect(state.snapshot.activeIndicator?.code).toBe('A.1.1.1');
    expect(state.snapshot.content).toEqual(INDICATOR_A111_CONTENT);
  });

  it('ignores selection of an unknown code', () => {
    let calls = 0;
    api.getProjectIndicators = () => of(LIST);
    api.getIndicatorDetail = () => {
      calls += 1;
      return of(detailWith('ready', INDICATOR_A111_CONTENT));
    };

    state.loadProjectIndicators('project-1');
    state.selectIndicator('Z.9.9.9');
    expect(calls).toBe(0);
  });
});

describe('IndicatorStateService version loading', () => {
  let state: IndicatorStateService;
  let api: IndicatorApiService;

  const OLDER_CONTENT: IndicatorContent = {
    sections: [
      {
        id: 'section-content',
        heading: '',
        blocks: [{ id: 'block-content', runs: [{ text: 'Older version text' }] }],
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), IndicatorStateService],
    });
    api = TestBed.inject(IndicatorApiService);
    state = TestBed.inject(IndicatorStateService);
    api.getProjectIndicators = () => of(LIST);
    api.getIndicatorDetail = () => of(detailWith('ready', INDICATOR_A111_CONTENT));
    state.loadProjectIndicators('project-1');
    state.selectIndicator('A.1.1.1');
  });

  it('loads a version by id, swapping content and recording the active version', () => {
    const requested: Array<readonly [string, string]> = [];
    api.getVersion = (indicatorId: string, versionId: string) => {
      requested.push([indicatorId, versionId]);
      return of({ versionId, content: OLDER_CONTENT });
    };

    state.loadVersion('ver-older');

    expect(requested).toEqual([['ind-test', 'ver-older']]);
    expect(state.snapshot.content).toEqual(OLDER_CONTENT);
    expect(latest(state.activeVersionId$)).toBe('ver-older');
  });

  it('clears the active version when a fresh indicator detail loads', () => {
    api.getVersion = (_indicatorId: string, versionId: string) =>
      of({ versionId, content: OLDER_CONTENT });
    state.loadVersion('ver-older');
    expect(latest(state.activeVersionId$)).toBe('ver-older');

    state.selectIndicator('A.1.1.1');
    expect(latest(state.activeVersionId$)).toBeNull();
    expect(state.snapshot.content).toEqual(INDICATOR_A111_CONTENT);
  });

  it('skips the request when the requested version is already loaded', () => {
    let calls = 0;
    api.getVersion = (_indicatorId: string, versionId: string) => {
      calls += 1;
      return of({ versionId, content: OLDER_CONTENT });
    };

    state.loadVersion('ver-older');
    expect(calls).toBe(1);

    state.loadVersion('ver-older');
    expect(calls).toBe(1);

    state.loadVersion('ver-newer');
    expect(calls).toBe(2);
  });

  it('skips the request for the current version already in memory after detail load', () => {
    let calls = 0;
    api.getVersion = (_indicatorId: string, versionId: string) => {
      calls += 1;
      return of({ versionId, content: OLDER_CONTENT });
    };
    api.getIndicatorDetail = () =>
      of({
        ...detailWith('ready', INDICATOR_A111_CONTENT),
        currentVersionId: 'ver-current',
        currentVersionContent: INDICATOR_A111_CONTENT,
      });
    state.selectIndicator('A.1.1.1');

    state.loadVersion('ver-current');

    expect(calls).toBe(0);
    expect(state.snapshot.content).toEqual(INDICATOR_A111_CONTENT);
  });

  it('restores the cached current version without a request after viewing an older one', () => {
    let calls = 0;
    api.getVersion = (_indicatorId: string, versionId: string) => {
      calls += 1;
      return of({ versionId, content: OLDER_CONTENT });
    };
    api.getIndicatorDetail = () =>
      of({
        ...detailWith('ready', INDICATOR_A111_CONTENT),
        currentVersionId: 'ver-current',
        currentVersionContent: INDICATOR_A111_CONTENT,
      });
    state.selectIndicator('A.1.1.1');

    state.loadVersion('ver-older');
    expect(calls).toBe(1);
    expect(state.snapshot.content).toEqual(OLDER_CONTENT);

    state.loadVersion('ver-current');
    expect(calls).toBe(1);
    expect(state.snapshot.content).toEqual(INDICATOR_A111_CONTENT);
    expect(latest(state.activeVersionId$)).toBe('ver-current');
  });

  it('is a no-op when there is no active indicator', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), IndicatorStateService],
    });
    const freshApi = TestBed.inject(IndicatorApiService);
    const freshState = TestBed.inject(IndicatorStateService);

    let called = false;
    freshApi.getVersion = () => {
      called = true;
      return of({ versionId: 'x', content: { sections: [] } });
    };

    freshState.loadVersion('x');

    expect(called).toBe(false);
    expect(latest(freshState.activeVersionId$)).toBeNull();
  });
});
