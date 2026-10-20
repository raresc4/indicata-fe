import { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  applyRewrite,
  insertCitation,
  removeUnsourcedAt,
  selectedText,
  unsourcedRangeAt,
} from './indicator-editor-commands';
import { indicatorEditorExtensions } from './indicator-editor-extensions';

const DOC = {
  type: 'doc',
  content: [
    { type: 'sectionHeading', attrs: { sectionId: 's1' }, content: [{ type: 'text', text: 'H' }] },
    {
      type: 'blockParagraph',
      attrs: { blockId: 'b1' },
      content: [{ type: 'text', text: 'alpha beta gamma', marks: [{ type: 'unsourced' }] }],
    },
  ],
};

function makeEditor(): Editor {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return new Editor({
    element,
    extensions: [...indicatorEditorExtensions()],
    content: DOC as unknown as Record<string, unknown>,
  });
}

function paragraphRange(editor: Editor): { from: number; to: number } {
  let from = -1;
  let to = -1;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'blockParagraph') {
      from = pos + 1;
      to = pos + node.nodeSize - 1;
    }
    return true;
  });
  return { from, to };
}

describe('indicator editor commands', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = makeEditor();
  });

  afterEach(() => {
    editor.destroy();
  });

  function collectNodes(): { types: string[]; marks: string[] } {
    const types: string[] = [];
    const marks: string[] = [];
    editor.state.doc.descendants((node) => {
      types.push(node.type.name);
      node.marks.forEach((mark) => marks.push(mark.type.name));
      return true;
    });
    return { types, marks };
  }

  it('insertCitation adds a citation node and drops the unsourced mark over the range', () => {
    const range = paragraphRange(editor);
    insertCitation(editor, range, 2);
    const { types, marks } = collectNodes();
    expect(types).toContain('citation');
    expect(marks).not.toContain('unsourced');
    expect(marks).toContain('humanEdited');
  });

  it('selectedText returns the text within the range', () => {
    const range = paragraphRange(editor);
    expect(selectedText(editor, range)).toBe('alpha beta gamma');
  });

  it('applyRewrite replaces the selection and marks it human-edited', () => {
    const range = paragraphRange(editor);
    applyRewrite(editor, range, 'delta');
    expect(editor.getText()).toContain('delta');
    expect(editor.getText()).not.toContain('alpha beta gamma');
    expect(collectNodes().marks).toContain('humanEdited');
  });

  it('unsourcedRangeAt finds the range of the unsourced run', () => {
    const range = paragraphRange(editor);
    const found = unsourcedRangeAt(editor, range.from);
    expect(found).not.toBeNull();
    expect(selectedText(editor, found as { from: number; to: number })).toBe('alpha beta gamma');
  });

  it('removeUnsourcedAt drops the unsourced mark while keeping the text', () => {
    const range = paragraphRange(editor);
    const removed = removeUnsourcedAt(editor, range.from);
    expect(removed).toBe(true);
    expect(editor.getText()).toContain('alpha beta gamma');
    expect(collectNodes().marks).not.toContain('unsourced');
  });

  it('removeUnsourcedAt returns false when no unsourced mark is at the position', () => {
    const range = paragraphRange(editor);
    removeUnsourcedAt(editor, range.from);
    expect(removeUnsourcedAt(editor, range.from)).toBe(false);
  });
});
