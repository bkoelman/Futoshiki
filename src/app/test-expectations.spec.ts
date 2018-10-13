import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { Board } from './models/board';
import { BoardTextConverter } from './board-text-converter';

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

export function expectCandidates(coordinateText: string, digits: number[], board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const cell = board.getCell(coordinate);

    expect(cell).toBeDefined();
    if (cell) {
        expect(cell.value).toBeUndefined();
        const candidates = cell.getCandidates();

        expect(candidates.length).toBe(digits.length);
        expect(candidates.join()).toBe(digits.join());
    }
}

export function expectOperator(coordinateText: string, direction: MoveDirection, operator: ComparisonOperator, board: Board) {
    const coordinate = Coordinate.fromText(coordinateText, board.size);
    const operatorValue = board.getOperator(coordinate, direction);
    expect(ComparisonOperator[operatorValue]).toBe(ComparisonOperator[operator]);
}

export function expectBoard(board: Board, text: string) {
    const converter = new BoardTextConverter();
    const formatted = converter.boardToText(board);

    const textLinesTrimmed = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0).join('\n');
    expect('\n' + formatted).toBe('\n' + textLinesTrimmed);
}
