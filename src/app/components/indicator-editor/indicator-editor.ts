import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { IndicatorContent } from '../../models/indicator-content.model';
import { Indicator } from '../../models/indicator.model';
import { IndicatorViewToken } from '../../services/indicator-selectors';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorActionBar } from '../indicator-action-bar/indicator-action-bar';
import { IndicatorEditorHeader } from '../indicator-editor-header/indicator-editor-header';
import { IndicatorEditorToolbar } from '../indicator-editor-toolbar/indicator-editor-toolbar';
import { IndicatorDraftView } from '../indicator-draft-view/indicator-draft-view';
import { IndicatorEmptyView } from '../indicator-empty-view/indicator-empty-view';
import { IndicatorGeneratingView } from '../indicator-generating-view/indicator-generating-view';

interface EditorView {
  readonly indicator: Indicator | null;
  readonly content: IndicatorContent | null;
  readonly token: IndicatorViewToken;
}

@Component({
  selector: 'app-indicator-editor',
  imports: [
    AsyncPipe,
    IndicatorEditorToolbar,
    IndicatorEditorHeader,
    IndicatorDraftView,
    IndicatorEmptyView,
    IndicatorGeneratingView,
    IndicatorActionBar,
  ],
  host: {
    class: 'bg-background relative flex min-w-0 flex-1 flex-col',
  },
  templateUrl: './indicator-editor.html',
})
export class IndicatorEditor {
  private readonly state = inject(IndicatorStateService);

  protected readonly saveStatus$ = this.state.saveStatus$;

  protected readonly view$ = combineLatest([
    this.state.activeIndicator$,
    this.state.state$,
    this.state.viewToken$,
  ]).pipe(
    map(([indicator, screenState, token]): EditorView => ({
      indicator,
      content: screenState.content,
      token,
    })),
  );

  protected onGenerate(): void {
    this.state.generate();
  }

  protected onUploadSources(): void {
    this.state.setEvidenceTab('sources');
  }

  protected onRetrySave(): void {
    const content = this.state.snapshot.content;
    if (content !== null) {
      this.state.applyEdit(content);
    }
  }
}
