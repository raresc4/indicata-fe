import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { IndicatorGeneratingView } from './indicator-generating-view';

function render(): ReturnType<typeof TestBed.createComponent<IndicatorGeneratingView>> {
  const fixture = TestBed.createComponent(IndicatorGeneratingView);
  fixture.detectChanges();
  return fixture;
}

describe('IndicatorGeneratingView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IndicatorGeneratingView] });
  });

  it('renders the loading affordance', () => {
    const element = render().nativeElement as HTMLElement;
    expect(element.textContent).toContain('Drafting indicator');
    expect(element.textContent).toContain('Generating the indicator draft');
  });

  it('exposes the live status region', () => {
    const element = render().nativeElement as HTMLElement;
    expect(element.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it('has no detectable accessibility violations', async () => {
    const fixture = render();
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
