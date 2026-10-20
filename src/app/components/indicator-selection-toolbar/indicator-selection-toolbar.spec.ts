import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Editor } from '@tiptap/core';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { INDICATOR_A111, INDICATOR_A111_SOURCES } from '../../mocks/indicator-a111.mock';
import { IndicatorApiService } from '../../services/indicator-api.service';
import { indicatorEditorExtensions } from '../../services/indicator-editor-extensions';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorSelectionToolbar } from './indicator-selection-toolbar';

const DOC = {
  type: 'doc',
  content: [
    {
      type: 'blockParagraph',
      attrs: { blockId: 'b1' },
      content: [{ type: 'text', text: 'alpha beta gamma' }],
    },
  ],
};

function makeEditor(): Editor {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return new Editor({
    element,
    extensions: [...indicatorEditorExtensions()],
    content: DOC as unknown as Record<string, unknown>,
  });
}

describe('IndicatorSelectionToolbar', () => {
  let state: IndicatorStateService;
  let api: IndicatorApiService;
  let editor: Editor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorSelectionToolbar],
      providers: [provideHttpClient()],
    });
    state = TestBed.inject(IndicatorStateService);
    api = TestBed.inject(IndicatorApiService);
    vi.spyOn(state, 'snapshot', 'get').mockReturnValue({
      ...state.snapshot,
      activeIndicator: INDICATOR_A111,
      sources: INDICATOR_A111_SOURCES,
    });
    editor = makeEditor();
  });

  afterEach(() => {
    editor.destroy();
  });

  function render() {
    const fixture = TestBed.createComponent(IndicatorSelectionToolbar);
    fixture.componentRef.setInput('editor', editor);
    fixture.detectChanges();
    return fixture;
  }

  function selectAll(): void {
    editor.commands.focus();
    editor.commands.selectAll();
  }

  it('renders real focusable buttons when a selection is present', () => {
    const fixture = render();
    selectAll();
    fixture.componentInstance.sync();
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label') ?? b.textContent);
    expect(labels.some((l) => l?.includes('Bold'))).toBe(true);
  });

  it('rewrite calls IndicatorApiService.rewrite with the active code and selection', () => {
    const spy = vi.spyOn(api, 'rewrite').mockReturnValue(of('rewritten text'));
    const fixture = render();
    selectAll();
    fixture.componentInstance.sync();
    fixture.detectChanges();
    const rewriteButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('rewrite'));
    rewriteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    const [code, selection] = spy.mock.calls[0];
    expect(code).toBe('A.1.1.1');
    expect(selection).toContain('alpha beta gamma');
  });

  it('dismiss hides the toolbar', () => {
    const fixture = render();
    selectAll();
    fixture.componentInstance.sync();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="toolbar"]')).not.toBeNull();
    fixture.componentInstance.dismiss();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="toolbar"]')).toBeNull();
  });

  it('has no detectable accessibility violations', async () => {
    const fixture = render();
    selectAll();
    fixture.componentInstance.sync();
    fixture.detectChanges();
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
