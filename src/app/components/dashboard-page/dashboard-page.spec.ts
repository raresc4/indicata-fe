import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import axe from 'axe-core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { INDICATOR_A111_CONTENT } from '../../mocks/indicator-a111.mock';
import { IndicatorListItemDto } from '../../models/indicator-api.model';
import { IndicatorApiService, IndicatorDetail } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { DashboardPage } from './dashboard-page';

const LIST: readonly IndicatorListItemDto[] = [
  { id: 'id-a111', code: 'A.1.1.1', title: 'First', position: 1, status: 'ready' },
  { id: 'id-a112', code: 'A.1.1.2', title: 'Second', position: 2, status: 'empty' },
];

const DETAIL: IndicatorDetail = {
  indicator: { id: 'id-a111', code: 'A.1.1.1', title: 'First', position: 1, status: 'ready' },
  content: INDICATOR_A111_CONTENT,
  sources: [],
  versions: [],
  currentVersionId: null,
  currentVersionContent: null,
};

function activatedRouteStub(projectId: string): Partial<ActivatedRoute> {
  return {
    snapshot: {
      paramMap: convertToParamMap({ projectId }),
    } as ActivatedRoute['snapshot'],
  };
}

describe('DashboardPage', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<DashboardPage>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: activatedRouteStub('project-123') },
      ],
    });

    const api = TestBed.inject(IndicatorApiService);
    api.getProjectIndicators = () => of(LIST);
    api.getIndicatorDetail = () => of(DETAIL);

    fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
  });

  it('composes the four columns of the Indicators screen', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-sidebar-nav')).toBeTruthy();
    expect(el.querySelector('app-indicator-tree')).toBeTruthy();
    expect(el.querySelector('app-indicator-editor')).toBeTruthy();
    expect(el.querySelector('app-evidence-panel')).toBeTruthy();
  });

  it('loads the project tree from the route param and auto-selects the first indicator', () => {
    const state = fixture.debugElement.injector.get(IndicatorStateService);
    expect(state.snapshot.tree.length).toBeGreaterThan(0);
    expect(state.snapshot.expandedDomainIds).toContain('domain-a');
    expect(state.snapshot.activeIndicator?.code).toBe('A.1.1.1');
  });

  it('exposes exactly one main landmark for the editor column', () => {
    const el = fixture.nativeElement as HTMLElement;
    const mains = el.querySelectorAll('main');
    expect(mains.length).toBe(1);
    expect(mains[0].querySelector('app-indicator-editor')).toBeTruthy();
  });

  it('has no detectable accessibility violations', async () => {
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
