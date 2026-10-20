import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { of } from 'rxjs';

import { INDICATOR_A111_CONTENT } from '../../mocks/indicator-a111.mock';
import { stubIndicatorApi } from '../../mocks/indicator-api.stub';
import { Indicator } from '../../models/indicator.model';
import { IndicatorApiService, IndicatorDetail } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorActionBar } from './indicator-action-bar';

const BASE: Indicator = {
  id: 'ind',
  code: 'A.1.1.1',
  title: 'Title',
  position: 1,
  status: 'ready',
};

function select(state: IndicatorStateService, detail: IndicatorDetail): void {
  const api = TestBed.inject(IndicatorApiService);
  api.getIndicatorDetail = () => of(detail);
  api.getIndicator = () => of(detail);
  state.selectIndicator(detail.indicator.code);
}

function navButton(
  fixture: ReturnType<typeof TestBed.createComponent<IndicatorActionBar>>,
  label: string,
): HTMLButtonElement {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  return buttons.find((b) => (b.textContent ?? '').includes(label))!;
}

describe('IndicatorActionBar', () => {
  let state: IndicatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorActionBar],
      providers: [provideHttpClient(), IndicatorStateService],
    });
    stubIndicatorApi(TestBed.inject(IndicatorApiService));
    state = TestBed.inject(IndicatorStateService);
    state.loadTree('project-1');
  });

  it('disables Previous on the first indicator and enables Next', () => {
    select(state, {
      indicator: { ...BASE, code: 'A.1.1.1' },
      content: INDICATOR_A111_CONTENT,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = TestBed.createComponent(IndicatorActionBar);
    fixture.detectChanges();

    expect(navButton(fixture, 'Previous').disabled).toBe(true);
    expect(navButton(fixture, 'Next').disabled).toBe(false);
  });

  it('shows the current position derived from the tree', () => {
    select(state, {
      indicator: { ...BASE, code: 'A.1.1.1' },
      content: INDICATOR_A111_CONTENT,
      sources: [],
      versions: [],
      currentVersionId: null,
      currentVersionContent: null,
    });
    const fixture = TestBed.createComponent(IndicatorActionBar);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ')).toContain('1 / 39');
  });
});
