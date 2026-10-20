import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IndicatorVersion } from '../../models/indicator-version.model';
import { VersionRow } from './version-row';

const VERSION: IndicatorVersion = {
  id: 'ver-a111-v4',
  versionNumber: 4,
  origin: 'edited',
  createdAt: '2024-05-14T09:46:00.000Z',
};

function create(
  version: IndicatorVersion,
  selected: boolean,
  pickLabel: string,
  active = false,
): ReturnType<typeof TestBed.createComponent<VersionRow>> {
  const fixture = TestBed.createComponent(VersionRow);
  fixture.componentRef.setInput('version', version);
  fixture.componentRef.setInput('selected', selected);
  fixture.componentRef.setInput('pickLabel', pickLabel);
  fixture.componentRef.setInput('active', active);
  fixture.detectChanges();
  return fixture;
}

function buttonByLabel(
  fixture: ReturnType<typeof TestBed.createComponent<VersionRow>>,
  fragment: string,
): HTMLButtonElement {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  const match = buttons.find((button) =>
    (button.getAttribute('aria-label') ?? '').includes(fragment),
  );
  if (match === undefined) {
    throw new Error(`No button matching "${fragment}"`);
  }
  return match;
}

describe('VersionRow', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [VersionRow] });
  });

  it('renders the version number, origin label and a formatted timestamp', () => {
    const fixture = create(VERSION, false, '');
    const text = (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('v4');
    expect(text).toContain('Edited');
    expect(text).toContain('2024');
    expect(text).not.toContain('2024-05-14T09:46');
  });

  it('maps each origin to its label', () => {
    const generated = create({ ...VERSION, origin: 'generated' }, false, '');
    expect((generated.nativeElement.textContent ?? '').replace(/\s+/g, ' ')).toContain('Generated');

    const unified = create({ ...VERSION, origin: 'unified' }, false, '');
    expect((unified.nativeElement.textContent ?? '').replace(/\s+/g, ' ')).toContain('Unified');
  });

  it('emits select with the version number when activated', () => {
    const fixture = create(VERSION, false, '');
    const emitted = vi.fn();
    fixture.componentInstance.select.subscribe(emitted);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitted).toHaveBeenCalledWith(4);
  });

  it('reflects selection through aria-pressed and the pick label', () => {
    const fixture = create(VERSION, true, 'A');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect((fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ')).toContain('A');
  });

  it('renders a Select button and emits load with the version id when activated', () => {
    const fixture = create(VERSION, false, '');
    const emitted = vi.fn();
    fixture.componentInstance.load.subscribe(emitted);

    const selectButton = buttonByLabel(fixture, 'Load version 4');
    expect((selectButton.textContent ?? '').trim()).toContain('Select');
    selectButton.click();

    expect(emitted).toHaveBeenCalledWith('ver-a111-v4');
  });

  it('reflects the active version through the Select button label and aria-pressed', () => {
    const fixture = create(VERSION, false, '', true);
    const viewingButton = buttonByLabel(fixture, 'Currently viewing version 4');
    expect(viewingButton.getAttribute('aria-pressed')).toBe('true');
    expect((viewingButton.textContent ?? '').trim()).toContain('Viewing');
    expect(viewingButton.classList.contains('bg-primary')).toBe(true);
    expect(viewingButton.classList.contains('hover:bg-primary/90')).toBe(true);
  });

  it('has no detectable accessibility violations', async () => {
    const fixture = create(VERSION, true, 'A');
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
