import { Cycle } from '../models/cycle.model';

export const DOMAINS_BY_CYCLE: Record<Cycle, readonly string[]> = {
  Bachelor: [
    'Calculatoare și Tehnologia Informației',
    'Automatică și Informatică Aplicată',
    'Electronică Aplicată',
    'Inginerie Economică',
    'Arhitectură',
  ],
  Master: [
    'Ingineria Calculatoarelor',
    'Inginerie Software',
    'Sisteme Electronice Avansate',
    'Management și Inginerie Industrială',
    'Arhitectură și Urbanism',
  ],
  Doctorate: [
    'Calculatoare și Tehnologia Informației (Computer Engineering)',
    'Inginerie Electronică, Telecomunicații și Tehnologii Informaționale',
    'Ingineria Sistemelor',
    'Inginerie Mecanică',
    'Arhitectură',
  ],
};
