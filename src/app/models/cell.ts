export interface Cell {
    readonly value: number | undefined;
    readonly isFixed: boolean;

    getPossibleValues(): number[];
    getMinimum(): number | undefined;
    getMaximum(): number | undefined;

    setFixedValue(digit: number);
    setUserValue(digit: number);
    removeDraftValue(digit: number);
}
