export interface Cell {
  readonly value: number | undefined;
  readonly isFixed: boolean;
  readonly isEmpty: boolean;

  containsCandidate(digit: number): boolean;
  getCandidates(): ReadonlySet<number>;
  getMinimum(): number | undefined;
  getMaximum(): number | undefined;

  setFixedValue(digit: number): void;
  setUserValue(digit: number): void;
  setCandidates(digits: ReadonlySet<number>): void;
  removeCandidate(digit: number): void;
}
