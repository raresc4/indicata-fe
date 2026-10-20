import { AnyExtension, Mark, Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

function readStringAttr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumberAttr(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

const CITATION_CLASS =
  'inline-flex items-center rounded px-1 text-xs font-sans bg-primary-container text-on-primary-container cursor-pointer';

const MISSING_DOC_CLASS =
  'inline-flex items-center rounded px-1 text-xs font-sans uppercase bg-warning-container text-on-warning-container';

const UNSOURCED_CLASS = 'underline decoration-dotted decoration-warning text-on-surface';

const HUMAN_EDITED_CLASS = 'bg-success-container text-on-success-container';

export const Citation = Node.create({
  name: 'citation',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      sourceRef: {
        default: 0,
        parseHTML: (element: HTMLElement): number =>
          readNumberAttr(element.getAttribute('data-source-ref'), 0),
        renderHTML: (attributes: Record<string, unknown>): Record<string, string> => ({
          'data-source-ref': String(readNumberAttr(attributes['sourceRef'], 0)),
        }),
      },
      label: {
        default: '',
        parseHTML: (element: HTMLElement): string => readStringAttr(element.textContent, ''),
        renderHTML: (): Record<string, string> => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-citation]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const label = readStringAttr(node.attrs['label'], '');
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-citation': '',
        tabindex: '0',
        role: 'button',
        class: CITATION_CLASS,
      }),
      label,
    ];
  },
});

export const MissingDoc = Node.create({
  name: 'missingDoc',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      label: {
        default: '',
        parseHTML: (element: HTMLElement): string =>
          readStringAttr(element.getAttribute('title'), ''),
        renderHTML: (attributes: Record<string, unknown>): Record<string, string> => ({
          title: readStringAttr(attributes['label'], ''),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-missing-doc]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-missing-doc': '',
        tabindex: '0',
        role: 'button',
        'aria-haspopup': 'menu',
        'aria-label': 'Missing document, upload a source',
        class: MISSING_DOC_CLASS,
      }),
      'DOCUMENT LIPSĂ',
    ];
  },
});

export const Unsourced = Mark.create({
  name: 'unsourced',

  parseHTML() {
    return [{ tag: 'span[data-unsourced]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-unsourced': '',
        tabindex: '0',
        role: 'button',
        'aria-haspopup': 'menu',
        'aria-label': 'Unsourced claim, resolve source',
        class: UNSOURCED_CLASS,
      }),
      0,
    ];
  },
});

export const HumanEdited = Mark.create({
  name: 'humanEdited',

  parseHTML() {
    return [{ tag: 'span[data-human-edited]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-human-edited': '',
        class: HUMAN_EDITED_CLASS,
      }),
      0,
    ];
  },
});

export const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: 'block+',
});

export const SectionHeading = Node.create({
  name: 'sectionHeading',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      sectionId: {
        default: '',
        parseHTML: (element: HTMLElement): string =>
          readStringAttr(element.getAttribute('data-section-id'), ''),
        renderHTML: (attributes: Record<string, unknown>): Record<string, string> => ({
          'data-section-id': readStringAttr(attributes['sectionId'], ''),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'h2[data-section-heading]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'h2',
      mergeAttributes(HTMLAttributes, {
        'data-section-heading': '',
        class: 'font-serif text-xl text-on-surface',
      }),
      0,
    ];
  },
});

export const BlockParagraph = Node.create({
  name: 'blockParagraph',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      blockId: {
        default: '',
        parseHTML: (element: HTMLElement): string =>
          readStringAttr(element.getAttribute('data-block-id'), ''),
        renderHTML: (attributes: Record<string, unknown>): Record<string, string> => ({
          'data-block-id': readStringAttr(attributes['blockId'], ''),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'p[data-block-paragraph]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, {
        'data-block-paragraph': '',
        class: 'font-sans text-on-surface',
      }),
      0,
    ];
  },
});

export function indicatorEditorExtensions(): readonly AnyExtension[] {
  return [
    StarterKit.configure({ document: false }),
    Document,
    SectionHeading,
    BlockParagraph,
    Citation,
    MissingDoc,
    Unsourced,
    HumanEdited,
  ];
}
