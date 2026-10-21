import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { IndicatorContent } from '../models/indicator-content.model';
import { INDICATOR_A111_CONTENT } from '../mocks/indicator-a111.mock';
import {
  CitationNode,
  EditorDoc,
  InlineNode,
  MissingDocNode,
  TextNode,
  appendStreamedText,
  fromEditorDoc,
  toEditorDoc,
} from './indicator-editor-model';

function inlineNodes(doc: EditorDoc): readonly InlineNode[] {
  const result: InlineNode[] = [];
  for (const node of doc.content) {
    if (node.type === 'blockParagraph') {
      for (const inline of node.content ?? []) {
        result.push(inline);
      }
    }
  }
  return result;
}

describe('indicator-editor-model round-trip', () => {
  it('restores the A.1.1.1 content exactly after a model -> doc -> model cycle', () => {
    const restored = fromEditorDoc(toEditorDoc(INDICATOR_A111_CONTENT));
    expect(restored).toEqual(INDICATOR_A111_CONTENT);
  });

  it('preserves all citation sourceRef values 1..5 as citation nodes', () => {
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const citations = inlineNodes(doc).filter(
      (node): node is CitationNode => node.type === 'citation',
    );
    const refs = citations.map((node) => node.attrs.sourceRef).sort((a, b) => a - b);
    expect(refs).toEqual([1, 2, 3, 4, 5]);
  });

  it('encodes a missing-doc run as a missingDoc node carrying its label', () => {
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const missing = inlineNodes(doc).filter(
      (node): node is MissingDocNode => node.type === 'missingDoc',
    );
    expect(missing).toHaveLength(1);
    expect(missing[0].attrs.label).toContain('Regulamentul de organizare');
  });

  it('encodes unsourced and human-edited runs as text marks', () => {
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const texts = inlineNodes(doc).filter((node): node is TextNode => node.type === 'text');
    const unsourced = texts.filter((node) => node.marks?.some((mark) => mark.type === 'unsourced'));
    const humanEdited = texts.filter((node) =>
      node.marks?.some((mark) => mark.type === 'humanEdited'),
    );
    expect(unsourced).toHaveLength(2);
    expect(humanEdited).toHaveLength(1);
  });

  it('maps each section heading to a sectionHeading node with the section id', () => {
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const headings = doc.content.filter((node) => node.type === 'sectionHeading');
    expect(headings.map((node) => node.attrs.sectionId)).toEqual([
      'section-facts',
      'section-analysis',
      'section-future',
    ]);
  });
});

describe('indicator-editor-model leading paragraphs', () => {
  it('keeps a blockParagraph that precedes the first sectionHeading', () => {
    const doc: EditorDoc = {
      type: 'doc',
      content: [
        {
          type: 'blockParagraph',
          attrs: { blockId: 'block-typed' },
          content: [{ type: 'text', text: 'Typed before heading' }],
        },
        {
          type: 'sectionHeading',
          attrs: { sectionId: 'section-facts' },
          content: [{ type: 'text', text: 'Facts' }],
        },
        {
          type: 'blockParagraph',
          attrs: { blockId: 'block-1' },
          content: [{ type: 'text', text: 'Body' }],
        },
      ],
    };
    const restored = fromEditorDoc(doc);
    expect(restored.sections).toHaveLength(2);
    expect(restored.sections[0]).toEqual({
      id: '',
      heading: '',
      blocks: [{ id: 'block-typed', runs: [{ text: 'Typed before heading' }] }],
    });
    expect(restored.sections[1].heading).toBe('Facts');
    expect(restored.sections[1].blocks[0].runs[0].text).toBe('Body');
  });

  it('keeps a document that is only a leading paragraph', () => {
    const doc: EditorDoc = {
      type: 'doc',
      content: [
        {
          type: 'blockParagraph',
          attrs: { blockId: 'block-only' },
          content: [{ type: 'text', text: 'Only text' }],
        },
      ],
    };
    const restored = fromEditorDoc(doc);
    expect(restored.sections).toEqual([
      { id: '', heading: '', blocks: [{ id: 'block-only', runs: [{ text: 'Only text' }] }] },
    ]);
  });

  it('round-trips heading-first content unchanged', () => {
    const restored = fromEditorDoc(toEditorDoc(INDICATOR_A111_CONTENT));
    expect(restored).toEqual(INDICATOR_A111_CONTENT);
  });
});

describe('indicator-editor-model appendStreamedText', () => {
  it('appends to the end of the last paragraph of the last section', () => {
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const next = appendStreamedText(doc, ' Addendum.');
    const restored = fromEditorDoc(next);
    const lastSection = restored.sections[restored.sections.length - 1];
    const lastBlock = lastSection.blocks[lastSection.blocks.length - 1];
    const lastRun = lastBlock.runs[lastBlock.runs.length - 1];
    expect(lastRun.text.endsWith(' Addendum.')).toBe(true);
  });

  it('does not mutate the original doc', () => {
    const doc = toEditorDoc(INDICATOR_A111_CONTENT);
    const snapshot = JSON.stringify(doc);
    appendStreamedText(doc, ' extra');
    expect(JSON.stringify(doc)).toBe(snapshot);
  });

  it('creates structure when appending into an empty doc', () => {
    const empty: EditorDoc = { type: 'doc', content: [] };
    const next = appendStreamedText(empty, 'hello');
    const restored = fromEditorDoc(next);
    expect(restored.sections).toHaveLength(1);
    expect(restored.sections[0].blocks[0].runs[0].text).toBe('hello');
  });

  it('reconstructs the concatenation of a sequence of chunks', () => {
    const chunks = ['The ', 'quick ', 'brown ', 'fox'];
    let doc: EditorDoc = { type: 'doc', content: [] };
    for (const chunk of chunks) {
      doc = appendStreamedText(doc, chunk);
    }
    const restored = fromEditorDoc(doc);
    const text = restored.sections[0].blocks[0].runs.map((run) => run.text).join('');
    expect(text).toBe(chunks.join(''));
  });
});

const runArb: fc.Arbitrary<{ readonly text: string }> = fc
  .string({ minLength: 1 })
  .map((text) => ({ text }));

const contentArb: fc.Arbitrary<IndicatorContent> = fc
  .array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      heading: fc.string({ minLength: 1 }),
      blocks: fc.array(
        fc.record({
          id: fc.string({ minLength: 1 }),
          runs: fc.array(runArb, { minLength: 1, maxLength: 4 }),
        }),
        { minLength: 1, maxLength: 3 },
      ),
    }),
    { minLength: 1, maxLength: 3 },
  )
  .map((sections) => ({ sections }));

describe('indicator-editor-model round-trip property', () => {
  it('Feature: indicators-page, Property 4: For all generated simple contents, fromEditorDoc(toEditorDoc(content)) equals content', () => {
    fc.assert(
      fc.property(contentArb, (content) => {
        expect(fromEditorDoc(toEditorDoc(content))).toEqual(content);
      }),
      { numRuns: 100 },
    );
  });
});
