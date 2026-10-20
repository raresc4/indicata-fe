import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IndicatorDomain } from '../../models/indicator-tree.model';
import { INDICATORS_TREE } from '../../mocks/indicators-tree.mock';
import { IndicatorTreeDomain } from './indicator-tree-domain';

const DOMAIN: IndicatorDomain = INDICATORS_TREE[0];

@Component({
  imports: [IndicatorTreeDomain],
  template: `
    <app-indicator-tree-domain
      [domain]="domain()"
      [expanded]="expanded()"
      [activeCode]="activeCode()"
      (toggle)="toggled = $event"
      (select)="selected = $event"
    />
  `,
})
class HostComponent {
  readonly domain = signal<IndicatorDomain>(DOMAIN);
  readonly expanded = signal(true);
  readonly activeCode = signal<string | null>(null);
  toggled: string | null = null;
  selected: string | null = null;
}

describe('IndicatorTreeDomain', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function header(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }

  it('renders the label and reviewed/total counter', () => {
    const text = header().textContent ?? '';
    expect(text).toContain('Domeniul A · Capacitate');
    expect(text).toContain('6/12');
  });

  it('renders a row per indicator when expanded', () => {
    const expected = DOMAIN.criteria.reduce((sum, c) => sum + c.indicators.length, 0);
    expect(fixture.nativeElement.querySelectorAll('app-indicator-tree-row').length).toBe(expected);
  });

  it('reflects aria-expanded and hides rows when collapsed', () => {
    expect(header().getAttribute('aria-expanded')).toBe('true');
    host.expanded.set(false);
    fixture.detectChanges();
    expect(header().getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelectorAll('app-indicator-tree-row').length).toBe(0);
  });

  it('emits toggle with the domain id when the header is activated', () => {
    header().click();
    expect(host.toggled).toBe(DOMAIN.id);
  });

  it('bubbles row selection with the indicator code', () => {
    const firstRow = fixture.nativeElement.querySelector('app-indicator-tree-row') as HTMLElement;
    firstRow.click();
    expect(host.selected).toBe(DOMAIN.criteria[0].indicators[0].code);
  });
});
