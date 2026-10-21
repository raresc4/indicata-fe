import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Editor } from '@tiptap/core';
import { Subject, debounceTime } from 'rxjs';

import { IndicatorContent } from '../../models/indicator-content.model';
import { EditorDoc, fromEditorDoc, toEditorDoc } from '../../services/indicator-editor-model';
import { removeUnsourcedAt } from '../../services/indicator-editor-commands';
import { indicatorEditorExtensions } from '../../services/indicator-editor-extensions';
import { IndicatorStateService } from '../../services/indicator-state.service';
import { IndicatorSelectionToolbar } from '../indicator-selection-toolbar/indicator-selection-toolbar';

type MarkerMenuKind = 'unsourced' | 'missing-doc';

interface MarkerMenu {
  readonly kind: MarkerMenuKind;
  readonly top: number;
  readonly left: number;
  readonly pos: number;
}

function scrollElementIntoView(element: Element): void {
  const scroll = (element as HTMLElement).scrollIntoView;
  if (typeof scroll === 'function') {
    scroll.call(element, { block: 'nearest' });
  }
}

@Component({
  selector: 'app-indicator-draft-view',
  imports: [IndicatorSelectionToolbar],
  styleUrl: './indicator-draft-view.scss',
  host: {
    class: 'border-outline-variant bg-surface block rounded-xl border p-8 sm:p-12',
    '(document:keydown.escape)': 'dismissMarkerMenu()',
  },
  templateUrl: './indicator-draft-view.html',
})
export class IndicatorDraftView {
  private readonly state = inject(IndicatorStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly content = input.required<IndicatorContent>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly toolbar = viewChild(IndicatorSelectionToolbar);
  private readonly markerMenuEl = viewChild<ElementRef<HTMLElement>>('markerMenuEl');

  protected readonly editorRef = signal<Editor | null>(null);
  protected readonly markerMenu = signal<MarkerMenu | null>(null);

  private editor: Editor | null = null;
  private applyingProgrammatic = false;
  private lastEmittedContent: IndicatorContent | null = null;
  private activeMarker: HTMLElement | null = null;
  private readonly updates = new Subject<void>();

  constructor() {
    this.updates.pipe(debounceTime(600), takeUntilDestroyed()).subscribe(() => {
      const editor = this.editor;
      if (editor === null) {
        return;
      }
      const edited = fromEditorDoc(editor.getJSON() as unknown as EditorDoc);
      this.lastEmittedContent = edited;
      this.state.applyEdit(edited);
    });

    this.state.selectedSourceId$
      .pipe(takeUntilDestroyed())
      .subscribe((ref) => this.emphasizeChips(ref));

    afterNextRender(() => {
      this.createEditor();
    });

    effect(() => {
      const next = this.content();
      const editor = this.editor;
      if (editor === null) {
        return;
      }
      if (next === this.lastEmittedContent) {
        this.lastEmittedContent = null;
        return;
      }
      this.applyingProgrammatic = true;
      editor.commands.setContent(toEditorDoc(next) as unknown as Record<string, unknown>);
      this.applyingProgrammatic = false;
      this.labelChips();
      this.emphasizeChips(this.state.snapshot.selectedSourceId);
    });

    this.destroyRef.onDestroy(() => this.teardown());
  }

  private createEditor(): void {
    const editor = new Editor({
      element: this.host().nativeElement,
      extensions: [...indicatorEditorExtensions()],
      content: toEditorDoc(this.content()) as unknown as Record<string, unknown>,
      editable: true,
      editorProps: {
        attributes: { 'aria-label': 'Indicator draft content' },
      },
    });
    editor.on('update', () => {
      if (this.applyingProgrammatic) {
        return;
      }
      this.updates.next();
    });
    editor.on('selectionUpdate', () => this.syncToolbar());
    editor.on('transaction', () => this.syncToolbar());
    editor.on('blur', () => this.toolbar()?.dismiss());
    editor.view.dom.addEventListener('click', this.onPointer);
    editor.view.dom.addEventListener('keydown', this.onKeydown);
    this.editor = editor;
    this.editorRef.set(editor);
    this.labelChips();
    this.emphasizeChips(this.state.snapshot.selectedSourceId);
  }

  private syncToolbar(): void {
    this.toolbar()?.sync();
  }

  private labelChips(): void {
    const editor = this.editor;
    if (editor === null) {
      return;
    }
    const sources = this.state.snapshot.sources;
    const chips = editor.view.dom.querySelectorAll<HTMLElement>('[data-source-ref]');
    chips.forEach((chip) => {
      const ref = Number(chip.getAttribute('data-source-ref'));
      const source = sources.find((candidate) => candidate.ref === ref);
      const label =
        source === undefined ? `Citation ${ref}` : `Citation ${ref}, ${source.documentTitle}`;
      chip.setAttribute('aria-label', label);
    });
  }

  private emphasizeChips(ref: number | null): void {
    const editor = this.editor;
    if (editor === null) {
      return;
    }
    const chips = editor.view.dom.querySelectorAll<HTMLElement>('[data-source-ref]');
    let first: HTMLElement | null = null;
    chips.forEach((chip) => {
      const match = ref !== null && Number(chip.getAttribute('data-source-ref')) === ref;
      if (match) {
        chip.setAttribute('data-chip-active', '');
        if (first === null) {
          first = chip;
        }
      } else {
        chip.removeAttribute('data-chip-active');
      }
    });
    if (first !== null) {
      scrollElementIntoView(first);
    }
  }

  private readonly onPointer = (event: Event): void => {
    this.activate(event.target, event);
  };

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if (this.activate(event.target, event)) {
      event.preventDefault();
    }
  };

  private activate(target: EventTarget | null, event: Event): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    const chip = target.closest<HTMLElement>('[data-source-ref]');
    if (chip !== null) {
      return this.activateChip(chip);
    }
    const unsourced = target.closest<HTMLElement>('[data-unsourced]');
    if (unsourced !== null) {
      this.openMarkerMenu('unsourced', unsourced, event);
      return true;
    }
    const missingDoc = target.closest<HTMLElement>('[data-missing-doc]');
    if (missingDoc !== null) {
      this.openMarkerMenu('missing-doc', missingDoc, event);
      return true;
    }
    return false;
  }

  private activateChip(chip: HTMLElement): boolean {
    const ref = Number(chip.getAttribute('data-source-ref'));
    if (!Number.isFinite(ref)) {
      return false;
    }
    this.state.highlightCitation(ref);
    this.state.selectSource(ref);
    return true;
  }

  private openMarkerMenu(kind: MarkerMenuKind, marker: HTMLElement, event: Event): void {
    const editor = this.editor;
    if (editor === null) {
      return;
    }
    const pos = editor.view.posAtDOM(marker, 0);
    const rect = marker.getBoundingClientRect();
    this.activeMarker = marker;
    this.markerMenu.set({ kind, pos, top: rect.bottom + 4, left: rect.left });
    event.preventDefault();
    const menu = this.markerMenuEl();
    if (menu !== undefined) {
      menu.nativeElement.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    }
  }

  protected dismissMarkerMenu(): void {
    if (this.markerMenu() === null) {
      return;
    }
    const marker = this.activeMarker;
    this.markerMenu.set(null);
    this.activeMarker = null;
    marker?.focus();
  }

  protected findSource(): void {
    this.state.setEvidenceTab('sources');
    this.dismissMarkerMenu();
  }

  protected removeClaim(pos: number): void {
    const editor = this.editor;
    if (editor !== null && removeUnsourcedAt(editor, pos)) {
      const edited = fromEditorDoc(editor.getJSON() as unknown as EditorDoc);
      this.lastEmittedContent = edited;
      this.state.applyEdit(edited);
    }
    this.dismissMarkerMenu();
  }

  protected uploadDocument(): void {
    this.state.setEvidenceTab('sources');
    this.state.addSource({ documentTitle: 'Untitled document', provenance: 'Uploaded' });
    this.dismissMarkerMenu();
  }

  private teardown(): void {
    const editor = this.editor;
    if (editor === null) {
      return;
    }
    editor.view.dom.removeEventListener('click', this.onPointer);
    editor.view.dom.removeEventListener('keydown', this.onKeydown);
    editor.destroy();
    this.editor = null;
    this.editorRef.set(null);
  }
}
