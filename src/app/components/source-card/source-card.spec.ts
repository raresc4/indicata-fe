import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IndicatorSource } from '../../models/indicator-source.model';
import { SourceCard } from './source-card';

const SOURCE: IndicatorSource = {
  ref: 1,
  documentTitle: 'Carta Universitară UPT',
  sourceType: 'upload',
  page: 8,
  excerpt: 'Art. 15: Senatul universitar...',
  provenance: 'Uploaded PDF',
  documentId: 'doc-carta-upt',
};

function create(
  source: IndicatorSource,
  selected: boolean,
): ReturnType<typeof TestBed.createComponent<SourceCard>> {
  const fixture = TestBed.createComponent(SourceCard);
  fixture.componentRef.setInput('source', source);
  fixture.componentRef.setInput('selected', selected);
  fixture.detectChanges();
  return fixture;
}

describe('SourceCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SourceCard] });
  });

  it('renders ref, title, type/page metadata, excerpt and provenance', () => {
    const fixture = create(SOURCE, false);
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('1');
    expect(text).toContain('Carta Universitară UPT');
    expect(text).toContain('PDF · p. 8');
    expect(text).toContain('Art. 15');
    expect(text).toContain('Uploaded PDF');
    expect(fixture.nativeElement.querySelector('mark')).not.toBeNull();
  });

  it('omits the page segment when the source has no page', () => {
    const fixture = create({ ...SOURCE, page: undefined }, false);
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('PDF');
    expect(text).not.toContain('p.');
  });

  it('emits select with the ref when the card button is activated', () => {
    const fixture = create(SOURCE, false);
    const emitted = vi.fn();
    fixture.componentInstance.select.subscribe(emitted);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitted).toHaveBeenCalledWith(1);
  });

  it('emits openDocument with the documentId from the open control', () => {
    const fixture = create(SOURCE, false);
    const emitted = vi.fn();
    fixture.componentInstance.openDocument.subscribe(emitted);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const open = buttons.find((b) => (b.textContent ?? '').includes('Open document'))!;
    open.click();

    expect(emitted).toHaveBeenCalledWith('doc-carta-upt');
  });

  it('reflects the selected styling through aria-pressed', () => {
    const fixture = create(SOURCE, true);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('has no detectable accessibility violations', async () => {
    const fixture = create(SOURCE, true);
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
