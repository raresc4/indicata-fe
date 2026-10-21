import { describe, expect, it } from 'vitest';

import { IndicatorDetailDto, IndicatorListItemDto } from '../models/indicator-api.model';
import { IndicatorContent } from '../models/indicator-content.model';
import {
  backendStatusToTreeStatus,
  buildIndicatorTree,
  codeToIdMap,
  contentStringToIndicatorContent,
  indicatorContentToContentString,
  mapIndicatorDetail,
} from './indicator-api.mapper';

const LIST: readonly IndicatorListItemDto[] = [
  { id: 'id-a111', code: 'A.1.1.1', title: 'First', position: 1, status: 'ready' },
  { id: 'id-a112', code: 'A.1.1.2', title: 'Second', position: 2, status: 'empty' },
  { id: 'id-a211', code: 'A.2.1.1', title: 'Third', position: 3, status: 'generating' },
  { id: 'id-b111', code: 'B.1.1.1', title: 'Fourth', position: 4, status: 'failed' },
];

describe('buildIndicatorTree', () => {
  it('groups a flat list into domains and criteria derived from code', () => {
    const tree = buildIndicatorTree(LIST);

    expect(tree.map((domain) => domain.id)).toEqual(['domain-a', 'domain-b']);
    const domainA = tree[0];
    expect(domainA.label).toBe('Domeniul A');
    expect(domainA.total).toBe(3);
    expect(domainA.reviewed).toBe(0);
    expect(domainA.criteria.map((criterion) => criterion.id)).toEqual([
      'criterion-a1',
      'criterion-a2',
    ]);
    expect(domainA.criteria[0].label).toBe('Criteriul A.1');
    expect(domainA.criteria[0].indicators.map((row) => row.code)).toEqual(['A.1.1.1', 'A.1.1.2']);
  });

  it('maps backend status into tree status', () => {
    const tree = buildIndicatorTree(LIST);
    expect(tree[0].criteria[0].indicators[0].status).toBe('draft');
    expect(tree[0].criteria[0].indicators[1].status).toBe('empty');
    expect(tree[0].criteria[1].indicators[0].status).toBe('empty');
    expect(tree[1].criteria[0].indicators[0].status).toBe('empty');
  });
});

describe('backendStatusToTreeStatus', () => {
  it('maps ready to draft and everything else to empty', () => {
    expect(backendStatusToTreeStatus('ready')).toBe('draft');
    expect(backendStatusToTreeStatus('empty')).toBe('empty');
    expect(backendStatusToTreeStatus('generating')).toBe('empty');
    expect(backendStatusToTreeStatus('failed')).toBe('empty');
  });
});

describe('contentStringToIndicatorContent', () => {
  it('wraps a non-empty string in a single section, block, and run', () => {
    const content = contentStringToIndicatorContent('Hello world');
    expect(content.sections).toHaveLength(1);
    expect(content.sections[0].blocks).toHaveLength(1);
    expect(content.sections[0].blocks[0].runs).toEqual([{ text: 'Hello world' }]);
  });

  it('returns an empty content for an empty string or null', () => {
    expect(contentStringToIndicatorContent('')).toEqual({ sections: [] });
    expect(contentStringToIndicatorContent(null)).toEqual({ sections: [] });
  });
});

describe('indicatorContentToContentString', () => {
  it('round-trips a plain string wrapped by contentStringToIndicatorContent', () => {
    expect(indicatorContentToContentString(contentStringToIndicatorContent('Hello world'))).toBe(
      'Hello world',
    );
  });

  it('joins headings and block text across sections with newlines', () => {
    const content: IndicatorContent = {
      sections: [
        {
          id: 's1',
          heading: 'Overview',
          blocks: [
            { id: 'b1', runs: [{ text: 'First ' }, { text: 'paragraph' }] },
            { id: 'b2', runs: [{ text: 'Second paragraph' }] },
          ],
        },
        {
          id: 's2',
          heading: '',
          blocks: [{ id: 'b3', runs: [{ text: 'Tail' }] }],
        },
      ],
    };

    expect(indicatorContentToContentString(content)).toBe(
      'Overview\nFirst paragraph\nSecond paragraph\nTail',
    );
  });

  it('returns an empty string for empty content', () => {
    expect(indicatorContentToContentString({ sections: [] })).toBe('');
  });
});

describe('codeToIdMap', () => {
  it('maps each code to its backend id', () => {
    const map = codeToIdMap(LIST);
    expect(map.get('A.1.1.1')).toBe('id-a111');
    expect(map.get('B.1.1.1')).toBe('id-b111');
    expect(map.has('Z.9.9.9')).toBe(false);
  });
});

describe('mapIndicatorDetail', () => {
  it('maps a detail with a current version into plain-text content and versions', () => {
    const dto: IndicatorDetailDto = {
      id: 'id-a111',
      code: 'A.1.1.1',
      title: 'First',
      position: 1,
      status: 'ready',
      currentVersion: {
        id: 'ver-2',
        versionNumber: 2,
        origin: 'edited',
        createdAt: '2026-01-01T00:00:00Z',
        content: 'Generated text',
      },
      versions: [
        { id: 'ver-1', versionNumber: 1, origin: 'generated', createdAt: '2026-01-01T00:00:00Z' },
        { id: 'ver-2', versionNumber: 2, origin: 'edited', createdAt: '2026-01-02T00:00:00Z' },
      ],
    };

    const detail = mapIndicatorDetail(dto);

    expect(detail.indicator).toEqual({
      id: 'id-a111',
      code: 'A.1.1.1',
      title: 'First',
      position: 1,
      status: 'ready',
    });
    expect(detail.content.sections[0].blocks[0].runs[0].text).toBe('Generated text');
    expect(detail.sources).toEqual([]);
    expect(detail.versions).toHaveLength(2);
    expect(detail.versions[0].versionNumber).toBe(1);
    expect(detail.currentVersionId).toBe('ver-2');
    expect(detail.currentVersionContent?.sections[0].blocks[0].runs[0].text).toBe('Generated text');
  });

  it('maps a detail without a current version into empty content', () => {
    const dto: IndicatorDetailDto = {
      id: 'id-a112',
      code: 'A.1.1.2',
      title: 'Second',
      position: 2,
      status: 'empty',
      currentVersion: null,
      versions: [],
    };

    const detail = mapIndicatorDetail(dto);

    expect(detail.content).toEqual({ sections: [] });
    expect(detail.versions).toEqual([]);
    expect(detail.currentVersionId).toBeNull();
    expect(detail.currentVersionContent).toBeNull();
  });
});
