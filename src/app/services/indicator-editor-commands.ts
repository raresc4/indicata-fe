import { Editor } from '@tiptap/core';

export interface SelectionRange {
  readonly from: number;
  readonly to: number;
}

export function hasTextSelection(editor: Editor): boolean {
  const { from, to, empty } = editor.state.selection;
  return !empty && to > from;
}

export function selectedText(editor: Editor, range: SelectionRange): string {
  return editor.state.doc.textBetween(range.from, range.to, ' ');
}

export function insertCitation(editor: Editor, range: SelectionRange, sourceRef: number): boolean {
  const label = `[${sourceRef}]`;
  return editor
    .chain()
    .focus()
    .setTextSelection(range)
    .unsetMark('unsourced')
    .setMark('humanEdited')
    .insertContentAt(range.to, { type: 'citation', attrs: { sourceRef, label } })
    .run();
}

export function unsourcedRangeAt(editor: Editor, pos: number): SelectionRange | null {
  const markType = editor.schema.marks['unsourced'];
  if (markType === undefined) {
    return null;
  }
  const { doc } = editor.state;
  let found: SelectionRange | null = null;
  doc.descendants((node, start) => {
    if (found !== null || !node.isText) {
      return found === null;
    }
    const end = start + node.nodeSize;
    const hasMark = node.marks.some((mark) => mark.type === markType);
    if (hasMark && pos >= start && pos <= end) {
      found = { from: start, to: end };
      return false;
    }
    return true;
  });
  return found;
}

export function removeUnsourcedAt(editor: Editor, pos: number): boolean {
  const range = unsourcedRangeAt(editor, pos);
  if (range === null) {
    return false;
  }
  return editor
    .chain()
    .setTextSelection(range)
    .unsetMark('unsourced')
    .setTextSelection(range.from)
    .run();
}

export function applyRewrite(editor: Editor, range: SelectionRange, text: string): boolean {
  return editor
    .chain()
    .focus()
    .insertContentAt(range, text)
    .setTextSelection({ from: range.from, to: range.from + text.length })
    .setMark('humanEdited')
    .run();
}
