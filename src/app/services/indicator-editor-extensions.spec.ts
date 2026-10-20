import { describe, expect, it } from 'vitest';
import { getSchema } from '@tiptap/core';
import { DOMSerializer, Node as PMNode, Schema } from '@tiptap/pm/model';

import { toEditorDoc } from './indicator-editor-model';
import { INDICATOR_A111_CONTENT } from '../mocks/indicator-a111.mock';
import {
  BlockParagraph,
  Citation,
  HumanEdited,
  MissingDoc,
  SectionHeading,
  Unsourced,
  indicatorEditorExtensions,
} from './indicator-editor-extensions';

function schema(): Schema {
  return getSchema([...indicatorEditorExtensions()]);
}

function serializeNode(node: PMNode): string {
  const serializer = DOMSerializer.fromSchema(node.type.schema);
  const fragment = serializer.serializeFragment(node.content);
  const host = document.createElement('div');
  host.appendChild(fragment);
  if (node.isLeaf) {
    const leaf = serializer.serializeNode(node);
    const leafHost = document.createElement('div');
    leafHost.appendChild(leaf);
    return leafHost.innerHTML;
  }
  return host.innerHTML;
}

describe('indicator-editor-extensions names', () => {
  it('exposes the node and mark names expected by the editor model', () => {
    expect(Citation.name).toBe('citation');
    expect(MissingDoc.name).toBe('missingDoc');
    expect(Unsourced.name).toBe('unsourced');
    expect(HumanEdited.name).toBe('humanEdited');
    expect(SectionHeading.name).toBe('sectionHeading');
    expect(BlockParagraph.name).toBe('blockParagraph');
  });

  it('returns a factory array containing every custom node and mark plus StarterKit', () => {
    const extensions = indicatorEditorExtensions();
    const names = extensions.map((extension) => extension.name);
    expect(names).toContain('citation');
    expect(names).toContain('missingDoc');
    expect(names).toContain('unsourced');
    expect(names).toContain('humanEdited');
    expect(names).toContain('sectionHeading');
    expect(names).toContain('blockParagraph');
    expect(names).toContain('starterKit');
  });
});

describe('indicator-editor-extensions renderHTML', () => {
  it('renders a citation chip carrying data-source-ref and its label', () => {
    const node = schema().nodes['citation'].create({ sourceRef: 3, label: '[3]' });
    const html = serializeNode(node);
    expect(html).toContain('data-citation');
    expect(html).toContain('data-source-ref="3"');
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('[3]');
  });

  it('renders a missing-document chip with data-missing-doc and keeps the label in a title', () => {
    const node = schema().nodes['missingDoc'].create({ label: 'ROF 2024' });
    const html = serializeNode(node);
    expect(html).toContain('data-missing-doc');
    expect(html).toContain('title="ROF 2024"');
    expect(html).toContain('DOCUMENT LIPS');
  });

  it('renders the unsourced mark with its data attribute', () => {
    const s = schema();
    const node = s.nodes['blockParagraph'].create({ blockId: 'b1' }, [
      s.text('claim', [s.marks['unsourced'].create()]),
    ]);
    const html = serializeNode(node);
    expect(html).toContain('data-unsourced');
    expect(html).toContain('claim');
  });

  it('renders the human-edited mark with its data attribute', () => {
    const s = schema();
    const node = s.nodes['blockParagraph'].create({ blockId: 'b1' }, [
      s.text('edited', [s.marks['humanEdited'].create()]),
    ]);
    const html = serializeNode(node);
    expect(html).toContain('data-human-edited');
    expect(html).toContain('edited');
  });
});

describe('indicator-editor-extensions schema compatibility', () => {
  it('accepts the A.1.1.1 editor doc JSON via Node.fromJSON', () => {
    const s = schema();
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const parsed = PMNode.fromJSON(s, doc);
    expect(parsed.type.name).toBe('doc');
    parsed.check();
    let citations = 0;
    let missing = 0;
    parsed.descendants((node) => {
      if (node.type.name === 'citation') {
        citations += 1;
      }
      if (node.type.name === 'missingDoc') {
        missing += 1;
      }
      return true;
    });
    expect(citations).toBe(5);
    expect(missing).toBe(1);
  });
});
