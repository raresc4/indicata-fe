import { IndicatorContent } from '../models/indicator-content.model';
import {
  EvidenceTab,
  IndicatorScreenState,
  SaveStatus,
} from '../models/indicator-screen-state.model';
import { IndicatorSource } from '../models/indicator-source.model';
import { IndicatorDomain } from '../models/indicator-tree.model';
import { IndicatorVersion } from '../models/indicator-version.model';
import { Indicator, IndicatorTreeStatus } from '../models/indicator.model';

export const INITIAL_INDICATOR_SCREEN_STATE: IndicatorScreenState = Object.freeze({
  tree: [],
  expandedDomainIds: [],
  filterQuery: '',
  filterStatuses: [],
  activeIndicator: null,
  activeVersionId: null,
  currentVersionId: null,
  currentVersionContent: null,
  content: null,
  sources: [],
  versions: [],
  selectedSourceId: null,
  evidenceTab: 'sources',
  diffSelection: [],
  saveStatus: 'idle',
});

export interface IndicatorDetailLoad {
  readonly indicator: Indicator;
  readonly content: IndicatorContent;
  readonly sources: readonly IndicatorSource[];
  readonly versions: readonly IndicatorVersion[];
  readonly currentVersionId: string | null;
  readonly currentVersionContent: IndicatorContent | null;
}

export type IndicatorAction =
  | { readonly type: 'setTree'; readonly tree: readonly IndicatorDomain[] }
  | { readonly type: 'loadIndicator'; readonly detail: IndicatorDetailLoad }
  | {
      readonly type: 'setFilter';
      readonly query: string;
      readonly statuses: readonly IndicatorTreeStatus[];
    }
  | { readonly type: 'toggleDomain'; readonly id: string }
  | { readonly type: 'selectSource'; readonly ref: number | null }
  | { readonly type: 'addSource'; readonly source: IndicatorSource }
  | { readonly type: 'setEvidenceTab'; readonly tab: EvidenceTab }
  | { readonly type: 'toggleDiffVersion'; readonly versionNumber: number }
  | { readonly type: 'clearDiffVersions' }
  | { readonly type: 'applyContent'; readonly content: IndicatorContent }
  | {
      readonly type: 'loadVersionContent';
      readonly content: IndicatorContent;
      readonly versionId: string;
    }
  | { readonly type: 'loadCurrentVersion' }
  | { readonly type: 'setSaveStatus'; readonly status: SaveStatus }
  | { readonly type: 'startGenerating' }
  | { readonly type: 'finishGenerating'; readonly detail: IndicatorDetailLoad };

export function indicatorReducer(
  state: IndicatorScreenState,
  action: IndicatorAction,
): IndicatorScreenState {
  switch (action.type) {
    case 'setTree':
      return { ...state, tree: action.tree };
    case 'loadIndicator':
      return {
        ...state,
        activeIndicator: action.detail.indicator,
        activeVersionId: action.detail.currentVersionId,
        currentVersionId: action.detail.currentVersionId,
        currentVersionContent: action.detail.currentVersionContent,
        content: action.detail.content,
        sources: action.detail.sources,
        versions: action.detail.versions,
        selectedSourceId: null,
        diffSelection: [],
        saveStatus: 'idle',
      };
    case 'setFilter':
      return { ...state, filterQuery: action.query, filterStatuses: action.statuses };
    case 'toggleDomain':
      return { ...state, expandedDomainIds: toggleId(state.expandedDomainIds, action.id) };
    case 'selectSource':
      return { ...state, selectedSourceId: action.ref };
    case 'addSource':
      return { ...state, sources: [...state.sources, action.source] };
    case 'setEvidenceTab':
      return { ...state, evidenceTab: action.tab };
    case 'toggleDiffVersion':
      return {
        ...state,
        diffSelection: toggleDiffVersion(state.diffSelection, action.versionNumber),
      };
    case 'clearDiffVersions':
      return state.diffSelection.length === 0 ? state : { ...state, diffSelection: [] };
    case 'applyContent':
      return { ...state, content: action.content };
    case 'loadVersionContent':
      return { ...state, content: action.content, activeVersionId: action.versionId };
    case 'loadCurrentVersion':
      return state.currentVersionContent === null
        ? state
        : {
            ...state,
            content: state.currentVersionContent,
            activeVersionId: state.currentVersionId,
          };
    case 'setSaveStatus':
      return { ...state, saveStatus: action.status };
    case 'startGenerating':
      return {
        ...state,
        activeIndicator:
          state.activeIndicator === null
            ? null
            : { ...state.activeIndicator, status: 'generating' },
        activeVersionId: null,
        content: null,
        saveStatus: 'idle',
      };
    case 'finishGenerating':
      return {
        ...state,
        activeIndicator: action.detail.indicator,
        activeVersionId: action.detail.currentVersionId,
        currentVersionId: action.detail.currentVersionId,
        currentVersionContent: action.detail.currentVersionContent,
        content: action.detail.content,
        sources: action.detail.sources,
        versions: action.detail.versions,
        selectedSourceId: null,
        diffSelection: [],
        saveStatus: 'idle',
      };
  }
}

function toggleId(ids: readonly string[], id: string): readonly string[] {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

function toggleDiffVersion(selection: readonly number[], versionNumber: number): readonly number[] {
  if (selection.includes(versionNumber)) {
    return selection.filter((value) => value !== versionNumber);
  }
  if (selection.length >= 2) {
    return [selection[1], versionNumber];
  }
  return [...selection, versionNumber];
}
