export interface SyncedScrollInput {
  sourceScrollTop: number;
  sourceScrollHeight: number;
  sourceClientHeight: number;
  targetScrollHeight: number;
  targetClientHeight: number;
}

export function getSyncedScrollTop(input: SyncedScrollInput): number {
  const sourceScrollableHeight =
    input.sourceScrollHeight - input.sourceClientHeight;
  const targetScrollableHeight =
    input.targetScrollHeight - input.targetClientHeight;

  if (sourceScrollableHeight <= 0 || targetScrollableHeight <= 0) {
    return 0;
  }

  const progress = input.sourceScrollTop / sourceScrollableHeight;

  return Math.round(progress * targetScrollableHeight);
}
