import { VersionDiffSegment } from './indicator-api.service';

function splitLines(text: string): readonly string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function longestCommonSubsequence(
  from: readonly string[],
  to: readonly string[],
): readonly number[][] {
  const rows = from.length;
  const cols = to.length;
  const table: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0),
  );
  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      table[i][j] =
        from[i] === to[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

export function diffLines(fromText: string, toText: string): readonly VersionDiffSegment[] {
  const from = splitLines(fromText);
  const to = splitLines(toText);
  const table = longestCommonSubsequence(from, to);
  const segments: VersionDiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < from.length && j < to.length) {
    if (from[i] === to[j]) {
      segments.push({ kind: 'unchanged', text: from[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      segments.push({ kind: 'removed', text: from[i] });
      i += 1;
    } else {
      segments.push({ kind: 'added', text: to[j] });
      j += 1;
    }
  }
  while (i < from.length) {
    segments.push({ kind: 'removed', text: from[i] });
    i += 1;
  }
  while (j < to.length) {
    segments.push({ kind: 'added', text: to[j] });
    j += 1;
  }
  return segments;
}
