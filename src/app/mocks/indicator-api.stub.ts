import { of } from 'rxjs';

import { IndicatorApiService, IndicatorDetail } from '../services/indicator-api.service';
import {
  INDICATOR_A111,
  INDICATOR_A111_CONTENT,
  INDICATOR_A111_SOURCES,
  INDICATOR_A111_VERSIONS,
} from './indicator-a111.mock';
import { INDICATORS_LIST } from './indicators-list.mock';

export const INDICATOR_A111_DETAIL: IndicatorDetail = {
  indicator: INDICATOR_A111,
  content: INDICATOR_A111_CONTENT,
  sources: INDICATOR_A111_SOURCES,
  versions: INDICATOR_A111_VERSIONS,
  currentVersionId: INDICATOR_A111_VERSIONS[0]?.id ?? null,
  currentVersionContent: INDICATOR_A111_CONTENT,
};

export function stubIndicatorApi(
  api: IndicatorApiService,
  detail: IndicatorDetail = INDICATOR_A111_DETAIL,
): void {
  api.getProjectIndicators = () => of(INDICATORS_LIST);
  api.getIndicatorDetail = () => of(detail);
  api.getIndicator = () => of(detail);
}
