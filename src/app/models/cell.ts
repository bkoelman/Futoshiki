export interface Cell {
    readonly value: number | undefined;
    readonly isFixed: boolean;
    readonly isEmpty: boolean;

    getCandidates(): number[];
    getMinimum(): number | undefined;
    getMaximum(): number | undefined;

    setFixedValue(digit: number): void;
    setUserValue(digit: number): void;
    setCandidates(digits: number[]): void;
    removeCandidate(digit: number): void;
}
