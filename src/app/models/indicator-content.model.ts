export type InlineMarkType = 'citation' | 'unsourced' | 'missing-doc' | 'human-edited';

export interface CitationMark {
  readonly type: 'citation';
  readonly sourceRef: number;
}

export interface UnsourcedMark {
  readonly type: 'unsourced';
}

export interface MissingDocMark {
  readonly type: 'missing-doc';
}

export interface HumanEditedMark {
  readonly type: 'human-edited';
}

export type InlineMark = CitationMark | UnsourcedMark | MissingDocMark | HumanEditedMark;

export interface InlineRun {
  readonly text: string;
  readonly marks?: readonly InlineMark[];
}

export interface ContentBlock {
  readonly id: string;
  readonly runs: readonly InlineRun[];
}

export interface ContentSection {
  readonly id: string;
  readonly heading: string;
  readonly blocks: readonly ContentBlock[];
}

export interface IndicatorContent {
  readonly sections: readonly ContentSection[];
}
