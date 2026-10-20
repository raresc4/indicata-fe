import { Cycle } from '../models/cycle.model';
import { Level } from '../models/level.model';

const CYCLE_TO_LEVEL: Record<Cycle, Level> = {
  Bachelor: 'bachelor',
  Master: 'master',
  Doctorate: 'doctorate',
};

export function cycleToLevel(cycle: Cycle): Level {
  return CYCLE_TO_LEVEL[cycle];
}
