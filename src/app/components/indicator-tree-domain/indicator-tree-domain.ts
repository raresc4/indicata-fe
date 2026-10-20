import { Component, computed, input, output } from '@angular/core';

import { IndicatorDomain } from '../../models/indicator-tree.model';
import { IndicatorTreeRow } from '../indicator-tree-row/indicator-tree-row';

@Component({
  selector: 'app-indicator-tree-domain',
  imports: [IndicatorTreeRow],
  templateUrl: './indicator-tree-domain.html',
})
export class IndicatorTreeDomain {
  readonly domain = input.required<IndicatorDomain>();
  readonly expanded = input<boolean>(true);
  readonly activeCode = input<string | null>(null);
  readonly toggle = output<string>();
  readonly select = output<string>();

  protected readonly headerId = computed<string>(() => `indicator-domain-${this.domain().id}`);
  protected readonly regionId = computed<string>(
    () => `indicator-domain-${this.domain().id}-region`,
  );
}
