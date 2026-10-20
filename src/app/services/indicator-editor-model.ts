import {
  ContentBlock,
  ContentSection,
  InlineMark,
  InlineRun,
  IndicatorContent,
} from '../models/indicator-content.model';

export interface SectionHeadingAttrs {
  readonly sectionId: string;
}

export interface SectionHeadingNode {
  readonly type: 'sectionHeading';
  readonly attrs: SectionHeadingAttrs;
  readonly content?: readonly TextNode[];
}

export interface BlockParagraphAttrs {
  readonly blockId: string;
}

export interface BlockParagraphNode {
  readonly type: 'blockParagraph';
  readonly attrs: BlockParagraphAttrs;
  readonly content?: readonly InlineNode[];
}

export interface UnsourcedMarkJson {
  readonly type: 'unsourced';
}

export interface HumanEditedMarkJson {
  readonly type: 'humanEdited';
}

export type TextMarkJson = UnsourcedMarkJson | HumanEditedMarkJson;

export interface TextNode {
  readonly type: 'text';
  readonly text: string;
  readonly marks?: readonly TextMarkJson[];
}

export interface CitationAttrs {
  readonly sourceRef: number;
  readonly label: string;
}

export interface CitationNode {
  readonly type: 'citation';
  readonly attrs: CitationAttrs;
}

export interface MissingDocAttrs {
  readonly label: string;
}

export interface MissingDocNode {
  readonly type: 'missingDoc';
  readonly attrs: MissingDocAttrs;
}

export type InlineNode = TextNode | CitationNode | MissingDocNode;

export type DocNode = SectionHeadingNode | BlockParagraphNode;

export interface EditorDoc {
  readonly type: 'doc';
  readonly content: readonly DocNode[];
}

function textMarksFor(marks: readonly InlineMark[]): readonly TextMarkJson[] {
  const result: TextMarkJson[] = [];
  for (const mark of marks) {
    if (mark.type === 'unsourced') {
      result.push({ type: 'unsourced' });
    } else if (mark.type === 'human-edited') {
      result.push({ type: 'humanEdited' });
    }
  }
  return result;
}

function runToInlineNode(run: InlineRun): InlineNode {
  const marks = run.marks ?? [];
  const citation = marks.find((mark): mark is Extract<InlineMark, { type: 'citation' }> => {
    return mark.type === 'citation';
  });
  if (citation !== undefined) {
    return { type: 'citation', attrs: { sourceRef: citation.sourceRef, label: run.text } };
  }
  if (marks.some((mark) => mark.type === 'missing-doc')) {
    return { type: 'missingDoc', attrs: { label: run.text } };
  }
  const textMarks = textMarksFor(marks);
  if (textMarks.length > 0) {
    return { type: 'text', text: run.text, marks: textMarks };
  }
  return { type: 'text', text: run.text };
}

function blockToParagraph(block: ContentBlock): BlockParagraphNode {
  const content = block.runs.map(runToInlineNode);
  if (content.length === 0) {
    return { type: 'blockParagraph', attrs: { blockId: block.id } };
  }
  return { type: 'blockParagraph', attrs: { blockId: block.id }, content };
}

function sectionToNodes(section: ContentSection): readonly DocNode[] {
  const heading: SectionHeadingNode =
    section.heading.length > 0
      ? {
          type: 'sectionHeading',
          attrs: { sectionId: section.id },
          content: [{ type: 'text', text: section.heading }],
        }
      : { type: 'sectionHeading', attrs: { sectionId: section.id } };
  const paragraphs = section.blocks.map(blockToParagraph);
  return [heading, ...paragraphs];
}

export function toEditorDoc(content: IndicatorContent): EditorDoc {
  const nodes: DocNode[] = [];
  for (const section of content.sections) {
    for (const node of sectionToNodes(section)) {
      nodes.push(node);
    }
  }
  return { type: 'doc', content: nodes };
}

function marksFromText(marks: readonly TextMarkJson[] | undefined): readonly InlineMark[] {
  if (marks === undefined) {
    return [];
  }
  const result: InlineMark[] = [];
  for (const mark of marks) {
    if (mark.type === 'unsourced') {
      result.push({ type: 'unsourced' });
    } else if (mark.type === 'humanEdited') {
      result.push({ type: 'human-edited' });
    }
  }
  return result;
}

function inlineNodeToRun(node: InlineNode): InlineRun {
  if (node.type === 'citation') {
    return {
      text: node.attrs.label,
      marks: [{ type: 'citation', sourceRef: node.attrs.sourceRef }],
    };
  }
  if (node.type === 'missingDoc') {
    return { text: node.attrs.label, marks: [{ type: 'missing-doc' }] };
  }
  const marks = marksFromText(node.marks);
  if (marks.length > 0) {
    return { text: node.text, marks };
  }
  return { text: node.text };
}

function headingText(node: SectionHeadingNode): string {
  if (node.content === undefined) {
    return '';
  }
  return node.content.map((text) => text.text).join('');
}

function paragraphToBlock(node: BlockParagraphNode): ContentBlock {
  const runs = (node.content ?? []).map(inlineNodeToRun);
  return { id: node.attrs?.blockId ?? '', runs };
}

export function fromEditorDoc(doc: EditorDoc): IndicatorContent {
  const sections: ContentSection[] = [];
  let current: { id: string; heading: string; blocks: ContentBlock[] } | null = null;
  for (const node of doc.content) {
    if (node.type === 'sectionHeading') {
      if (current !== null) {
        sections.push({ id: current.id, heading: current.heading, blocks: current.blocks });
      }
      current = { id: node.attrs?.sectionId ?? '', heading: headingText(node), blocks: [] };
    } else if (current !== null) {
      current.blocks.push(paragraphToBlock(node));
    }
  }
  if (current !== null) {
    sections.push({ id: current.id, heading: current.heading, blocks: current.blocks });
  }
  return { sections };
}

function appendTextToParagraph(node: BlockParagraphNode, text: string): BlockParagraphNode {
  const content = node.content ?? [];
  const last = content[content.length - 1];
  if (last !== undefined && last.type === 'text' && last.marks === undefined) {
    const merged: TextNode = { type: 'text', text: `${last.text}${text}` };
    return {
      type: 'blockParagraph',
      attrs: node.attrs,
      content: [...content.slice(0, content.length - 1), merged],
    };
  }
  const appended: TextNode = { type: 'text', text };
  return { type: 'blockParagraph', attrs: node.attrs, content: [...content, appended] };
}

function emptyStreamDoc(text: string): EditorDoc {
  const section: SectionHeadingNode = {
    type: 'sectionHeading',
    attrs: { sectionId: 'section-streamed' },
  };
  const paragraph: BlockParagraphNode = {
    type: 'blockParagraph',
    attrs: { blockId: 'block-streamed' },
    content: [{ type: 'text', text }],
  };
  return { type: 'doc', content: [section, paragraph] };
}

export function appendStreamedText(doc: EditorDoc, text: string): EditorDoc {
  let lastParagraphIndex = -1;
  for (let index = doc.content.length - 1; index >= 0; index -= 1) {
    if (doc.content[index].type === 'blockParagraph') {
      lastParagraphIndex = index;
      break;
    }
  }
  if (lastParagraphIndex === -1) {
    if (doc.content.length === 0) {
      return emptyStreamDoc(text);
    }
    const paragraph: BlockParagraphNode = {
      type: 'blockParagraph',
      attrs: { blockId: 'block-streamed' },
      content: [{ type: 'text', text }],
    };
    return { type: 'doc', content: [...doc.content, paragraph] };
  }
  const target = doc.content[lastParagraphIndex];
  const updated = appendTextToParagraph(target as BlockParagraphNode, text);
  const nextContent = doc.content.map((node, index) =>
    index === lastParagraphIndex ? updated : node,
  );
  return { type: 'doc', content: nextContent };
}
