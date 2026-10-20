export type Cycle = 'Bachelor' | 'Master' | 'Doctorate';

export interface CycleOption {
  readonly value: Cycle;
  readonly label: string;
  readonly unit: 'Programme' | 'Domain';
  readonly description: string;
  readonly duration: string;
  readonly icon: string;
}
