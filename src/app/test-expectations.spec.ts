import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { Board } from './models/board';

export function expectEmptyCell(coordinateText: string, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    expect(cell.value).toBeUndefined();
}

export function expectSingleValue(coordinateText: string, value: number, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    expect(cell.value).toBe(value);
}

export function expectDraftValues(coordinateText: string, draftValues: number[], board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    expect(cell.value).toBeUndefined();
    const possibleValues = cell.getPossibleValues();

    expect(possibleValues.length).toBe(draftValues.length);
    expect(possibleValues.join()).toBe(draftValues.join());
}

export function expectOperator(coordinateText: string, direction: MoveDirection, operator: ComparisonOperator, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const operatorValue = board.getOperator(coordinate, direction);
    expect(operatorValue).toBe(operator);
}
