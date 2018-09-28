export interface Cell {
    readonly value: number | undefined;

    getPossibleValues(): number[];
    getMinimum(): number | undefined;
    getMaximum(): number | undefined;

    setUserValue(digit: number);
    removeDraftValue(digit: number);
}
