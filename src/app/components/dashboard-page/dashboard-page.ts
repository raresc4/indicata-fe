import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';

import { IndicatorStateService } from '../../services/indicator-state.service';
import { EvidencePanel } from '../evidence-panel/evidence-panel';
import { IndicatorEditor } from '../indicator-editor/indicator-editor';
import { IndicatorTree } from '../indicator-tree/indicator-tree';
import { SidebarNav } from '../sidebar-nav/sidebar-nav';

@Component({
  selector: 'app-dashboard-page',
  imports: [SidebarNav, IndicatorTree, IndicatorEditor, EvidencePanel],
  providers: [IndicatorStateService],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly state = inject(IndicatorStateService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    if (projectId === null) {
      return;
    }

    this.state.state$
      .pipe(
        map((state) => state.tree),
        filter((tree) => tree.length > 0),
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe((tree) => {
        const firstDomain = tree[0];
        this.state.toggleDomain(firstDomain.id);
        const firstCode = firstDomain.criteria[0]?.indicators[0]?.code;
        if (firstCode !== undefined) {
          this.state.selectIndicator(firstCode);
        }
      });

    this.state.loadProjectIndicators(projectId);
  }
}
