import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { Board } from './models/board';

export function expectEmptyCell(coordinateText: string, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    if (cell) {
        expect(cell.value).toBeUndefined();
    }
}

export function expectFixedValue(coordinateText: string, digit: number, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    if (cell) {
        expect(cell.isFixed).toBeTruthy();
        expect(cell.value).toBe(digit);
    }
}

export function expectSingleUserValue(coordinateText: string, digit: number, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    if (cell) {
        expect(cell.isFixed).toBeFalsy();
        expect(cell.value).toBe(digit);
    }
}

export function expectDraftValues(coordinateText: string, digits: number[], board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    if (cell) {
        expect(cell.value).toBeUndefined();
        const possibleValues = cell.getPossibleValues();

        expect(possibleValues.length).toBe(digits.length);
        expect(possibleValues.join()).toBe(digits.join());
    }
}

export function expectOperator(coordinateText: string, direction: MoveDirection, operator: ComparisonOperator, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const operatorValue = board.getOperator(coordinate, direction);
    expect(ComparisonOperator[operatorValue]).toBe(ComparisonOperator[operator]);
}
