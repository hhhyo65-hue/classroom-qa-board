export const SLOTS = [1, 2, 3, 4, 5, 6, 7] as const;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidSlot(slot: number): boolean {
  return Number.isInteger(slot) && slot >= 1 && slot <= 7;
}
