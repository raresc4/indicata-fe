import { Component, inject, input, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Editor } from '@tiptap/core';

import { IndicatorSource } from '../../models/indicator-source.model';
import {
  SelectionRange,
  applyRewrite,
  hasTextSelection,
  insertCitation,
  selectedText,
} from '../../services/indicator-editor-commands';
import { IndicatorApiService } from '../../services/indicator-api.service';
import { IndicatorStateService } from '../../services/indicator-state.service';

interface ToolbarPosition {
  readonly top: number;
  readonly left: number;
}

@Component({
  selector: 'app-indicator-selection-toolbar',
  imports: [MatMenuModule],
  host: {
    '(document:keydown.escape)': 'dismiss()',
  },
  templateUrl: './indicator-selection-toolbar.html',
})
export class IndicatorSelectionToolbar {
  private readonly state = inject(IndicatorStateService);
  private readonly api = inject(IndicatorApiService);

  readonly editor = input.required<Editor>();

  protected readonly visible = signal(false);
  protected readonly position = signal<ToolbarPosition | null>(null);
  protected readonly rewriting = signal(false);

  protected sources(): readonly IndicatorSource[] {
    return this.state.snapshot.sources;
  }

  sync(): void {
    const editor = this.editor();
    if (!hasTextSelection(editor)) {
      this.hide();
      return;
    }
    this.position.set(this.coords(editor));
    this.visible.set(true);
  }

  private coords(editor: Editor): ToolbarPosition {
    const { from, to } = editor.state.selection;
    try {
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      return { top: Math.max(start.top - 48, 8), left: (start.left + end.right) / 2 };
    } catch {
      return { top: 8, left: 8 };
    }
  }

  dismiss(): void {
    this.hide();
  }

  private hide(): void {
    this.visible.set(false);
    this.position.set(null);
  }

  private currentRange(): SelectionRange {
    const { from, to } = this.editor().state.selection;
    return { from, to };
  }

  protected toggleBold(): void {
    this.editor().chain().focus().toggleBold().run();
  }

  protected toggleItalic(): void {
    this.editor().chain().focus().toggleItalic().run();
  }

  protected addCitation(sourceRef: number): void {
    insertCitation(this.editor(), this.currentRange(), sourceRef);
    this.hide();
  }

  protected rewrite(): void {
    const code = this.state.snapshot.activeIndicator?.code;
    if (code === undefined || this.rewriting()) {
      return;
    }
    const editor = this.editor();
    const range = this.currentRange();
    const selection = selectedText(editor, range);
    this.rewriting.set(true);
    this.api.rewrite(code, selection).subscribe({
      next: (result) => {
        applyRewrite(editor, range, result);
        this.rewriting.set(false);
        this.hide();
      },
      error: () => {
        this.rewriting.set(false);
      },
    });
  }
}
