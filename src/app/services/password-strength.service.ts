import { Injectable } from '@angular/core';
import { adjacencyGraphs, dictionary as commonDictionary } from '@zxcvbn-ts/language-common';
import { type OptionsType, type Score, ZxcvbnFactory } from '@zxcvbn-ts/core';

export type PasswordStrengthScore = Score;

export interface PasswordStrengthResult {
  readonly score: PasswordStrengthScore;
  readonly label: string;
}

const STRENGTH_LABELS: Readonly<Record<PasswordStrengthScore, string>> = {
  0: 'Very weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const OPTIONS: OptionsType = {
  dictionary: { ...commonDictionary },
  graphs: adjacencyGraphs,
};

@Injectable({ providedIn: 'root' })
export class PasswordStrengthService {
  private readonly zxcvbn = new ZxcvbnFactory(OPTIONS);

  evaluate(password: string): PasswordStrengthResult {
    if (password.length === 0) {
      return { score: 0, label: '' };
    }

    const { score } = this.zxcvbn.check(password);

    return { score, label: STRENGTH_LABELS[score] };
  }
}
