import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IndicatorTreeStatus } from '../../models/indicator.model';
import { IndicatorTreeRow } from './indicator-tree-row';

@Component({
  imports: [IndicatorTreeRow],
  template: `
    <app-indicator-tree-row
      [code]="code()"
      [title]="title()"
      [status]="status()"
      [active]="active()"
      (select)="selected = $event"
    />
  `,
})
class HostComponent {
  readonly code = signal('A.1.1.1');
  readonly title = signal('Management system');
  readonly status = signal<IndicatorTreeStatus>('draft');
  readonly active = signal(false);
  selected: string | null = null;
}

function rowElement(
  fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>,
): HTMLElement {
  return fixture.nativeElement.querySelector('app-indicator-tree-row') as HTMLElement;
}

describe('IndicatorTreeRow', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the code, title, and status label', () => {
    const text = rowElement(fixture).textContent ?? '';
    expect(text).toContain('A.1.1.1');
    expect(text).toContain('Management system');
    expect(text).toContain('Draft');
  });

  it('exposes an accessible label naming the status', () => {
    expect(rowElement(fixture).getAttribute('aria-label')).toBe('A.1.1.1 Management system, Draft');
  });

  it('marks aria-current only when active', () => {
    expect(rowElement(fixture).getAttribute('aria-current')).toBeNull();
    host.active.set(true);
    fixture.detectChanges();
    expect(rowElement(fixture).getAttribute('aria-current')).toBe('true');
  });

  it('emits select with the code on click', () => {
    rowElement(fixture).click();
    expect(host.selected).toBe('A.1.1.1');
  });

  it('emits select on Enter and Space', () => {
    rowElement(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(host.selected).toBe('A.1.1.1');
    host.selected = null;
    rowElement(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(host.selected).toBe('A.1.1.1');
  });
});
