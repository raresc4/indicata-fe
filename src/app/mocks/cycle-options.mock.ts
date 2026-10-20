import { CycleOption } from '../models/cycle.model';

export const CYCLE_OPTIONS: readonly CycleOption[] = [
  {
    value: 'Bachelor',
    label: 'Bachelor',
    unit: 'Programme',
    description: 'Evaluation of a study programme',
    duration: 'Licență (3-4 years)',
    icon: 'school',
  },
  {
    value: 'Master',
    label: 'Master',
    unit: 'Domain',
    description: 'Evaluation of a study domain',
    duration: 'Masterat (1.5-2 years)',
    icon: 'menu_book',
  },
  {
    value: 'Doctorate',
    label: 'Doctorate',
    unit: 'Domain',
    description: 'Evaluation of a doctoral study domain',
    duration: 'Doctorat (IOSUD / 3-4 years)',
    icon: 'workspace_premium',
  },
];
