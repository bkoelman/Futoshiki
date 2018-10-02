export interface Cell {
    readonly value: number | undefined;
    readonly isFixed: boolean;

    getPossibleValues(): number[];
    getMinimum(): number | undefined;
    getMaximum(): number | undefined;

    setFixedValue(digit: number): void;
    setUserValue(digit: number): void;
    removeDraftValue(digit: number): void;
}
