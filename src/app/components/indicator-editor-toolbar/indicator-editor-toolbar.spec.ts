import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { IndicatorStateService } from '../../services/indicator-state.service';
import { stubIndicatorApi } from '../../mocks/indicator-api.stub';
import { IndicatorApiService } from '../../services/indicator-api.service';
import { IndicatorEditorToolbar } from './indicator-editor-toolbar';

describe('IndicatorEditorToolbar', () => {
  let state: IndicatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorEditorToolbar],
      providers: [provideHttpClient(), IndicatorStateService],
    });
    const api = TestBed.inject(IndicatorApiService);
    stubIndicatorApi(api);
    state = TestBed.inject(IndicatorStateService);
  });

  function create(): ReturnType<typeof TestBed.createComponent<IndicatorEditorToolbar>> {
    const fixture = TestBed.createComponent(IndicatorEditorToolbar);
    fixture.componentRef.setInput('code', 'A.1.1.1');
    fixture.componentRef.setInput('viewToken', 'draft');
    fixture.detectChanges();
    return fixture;
  }

  it('renders the active code and a status badge from the view token', () => {
    const fixture = create();
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('A.1.1.1');
    expect(text).toContain('AI Draft');
  });

  it('renders the current version label when an active version is loaded', () => {
    const api = TestBed.inject(IndicatorApiService);
    api.getVersion = (_indicatorId: string, versionId: string) =>
      of({ versionId, content: { sections: [] } });
    state.loadProjectIndicators('project-1');
    state.selectIndicator('A.1.1.1');
    state.loadVersion('ver-a111-v3');

    const fixture = create();
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('v3');
  });

  it('does not render a Regenerate button', () => {
    const fixture = create();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(buttons.some((b) => (b.textContent ?? '').trim().startsWith('Regenerate'))).toBe(false);
  });

  it('emits save and enables the Save button once an active version is loaded', () => {
    state.loadProjectIndicators('project-1');
    state.selectIndicator('A.1.1.1');

    const fixture = create();
    let emitted = false;
    fixture.componentInstance.save.subscribe(() => {
      emitted = true;
    });

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const saveButton = buttons.find((b) => (b.textContent ?? '').trim() === 'Save');

    expect(saveButton).toBeDefined();
    expect(saveButton?.disabled).toBe(false);

    saveButton?.click();
    expect(emitted).toBe(true);
  });

  it('disables the Save button when no active version is loaded', () => {
    const fixture = create();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const saveButton = buttons.find((b) => (b.textContent ?? '').trim() === 'Save');

    expect(saveButton?.disabled).toBe(true);
  });
});
