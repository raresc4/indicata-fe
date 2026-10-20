import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';

import { IndicatorDomain } from '../../models/indicator-tree.model';
import { IndicatorTreeStatus } from '../../models/indicator.model';
import { filterTree } from '../../services/indicator-selectors';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorTreeDomain } from '../indicator-tree-domain/indicator-tree-domain';

interface DomainView {
  readonly domain: IndicatorDomain;
  readonly expanded: boolean;
}

interface StatusFilterControls {
  readonly empty: FormControl<boolean>;
  readonly draft: FormControl<boolean>;
  readonly review: FormControl<boolean>;
}

const LEGEND: readonly { readonly status: IndicatorTreeStatus; readonly label: string }[] = [
  { status: 'empty', label: 'Empty' },
  { status: 'draft', label: 'Draft' },
  { status: 'review', label: 'Review' },
];

@Component({
  selector: 'app-indicator-tree',
  imports: [AsyncPipe, ReactiveFormsModule, IndicatorTreeDomain],
  host: {
    class: 'bg-surface border-outline-variant flex h-dvh w-72 shrink-0 flex-col border-r',
  },
  templateUrl: './indicator-tree.html',
})
export class IndicatorTree {
  protected readonly state = inject(IndicatorStateService);

  protected readonly search = new FormControl<string>('', { nonNullable: true });

  protected readonly statusFilter = new FormGroup<StatusFilterControls>({
    empty: new FormControl<boolean>(false, { nonNullable: true }),
    draft: new FormControl<boolean>(false, { nonNullable: true }),
    review: new FormControl<boolean>(false, { nonNullable: true }),
  });

  protected readonly legend = LEGEND;
  protected readonly filterOpen = signal<boolean>(false);

  protected readonly progress$ = this.state.progress$;
  protected readonly activeCode$ = this.state.activeIndicator$.pipe(
    map((indicator) => indicator?.code ?? null),
  );

  private readonly query$ = this.search.valueChanges.pipe(startWith(this.search.value));
  private readonly statuses$ = this.statusFilter.valueChanges.pipe(
    startWith(this.statusFilter.getRawValue()),
    map((value) => this.selectedStatuses(value)),
  );

  protected readonly visibleTree$ = combineLatest([
    this.state.state$,
    this.query$,
    this.statuses$,
  ]).pipe(
    map(([screenState, query, statuses]) =>
      filterTree(screenState.tree, query, statuses).map<DomainView>((domain) => ({
        domain,
        expanded: screenState.expandedDomainIds.includes(domain.id),
      })),
    ),
  );

  constructor() {
    combineLatest([this.query$, this.statuses$])
      .pipe(takeUntilDestroyed())
      .subscribe(([query, statuses]) => this.state.setFilter(query, statuses));
  }

  protected toggleFilter(): void {
    this.filterOpen.update((open) => !open);
  }

  protected dotClass(status: IndicatorTreeStatus): string {
    switch (status) {
      case 'draft':
        return 'bg-primary';
      case 'review':
        return 'bg-warning';
      case 'empty':
        return 'bg-outline';
    }
  }

  private selectedStatuses(
    value: Partial<Record<IndicatorTreeStatus, boolean>>,
  ): IndicatorTreeStatus[] {
    const statuses: IndicatorTreeStatus[] = [];
    for (const option of LEGEND) {
      if (value[option.status]) {
        statuses.push(option.status);
      }
    }
    return statuses;
  }
}
