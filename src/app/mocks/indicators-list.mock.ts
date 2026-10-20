import { IndicatorBackendStatus, IndicatorListItemDto } from '../models/indicator-api.model';
import { INDICATORS_TREE } from './indicators-tree.mock';

export const INDICATORS_LIST: readonly IndicatorListItemDto[] = INDICATORS_TREE.flatMap((domain) =>
  domain.criteria.flatMap((criterion) =>
    criterion.indicators.map((row): Omit<IndicatorListItemDto, 'position'> => {
      const status: IndicatorBackendStatus = row.status === 'draft' ? 'ready' : 'empty';
      return { id: `id-${row.code}`, code: row.code, title: row.title, status };
    }),
  ),
).map((item, index) => ({ ...item, position: index }));
