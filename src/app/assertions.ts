export function isInteger(value: number): boolean {
    return !isNaN(value) && Math.floor(value) === value;
}

export function assertBoardSizeIsValid(size: number): void {
    if (!isInteger(size) || size < 4 || size > 9) {
        throw new Error(`Invalid board size '${size}x${size}'.`);
    }
}
