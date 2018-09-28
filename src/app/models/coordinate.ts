import { MoveDirection } from './move-direction.enum';

export class Coordinate {
    readonly row: number;
    readonly column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
    }

    static fromIndex(index: number, boardSize: number): Coordinate {
        const row = Math.floor(index / boardSize) + 1;
        const column = (index % boardSize) + 1;
        return new Coordinate(row, column);
    }

    toIndex(boardSize: number): number {
        return (this.row - 1) * boardSize + this.column - 1;
    }

    toString(): string {
        return `(${this.row},${this.column})`;
    }

    moveOne(direction: MoveDirection): Coordinate {
        switch (direction) {
            case MoveDirection.Left:
                return new Coordinate(this.row, this.column - 1);
            case MoveDirection.Right:
                return new Coordinate(this.row, this.column + 1);
            case MoveDirection.Up:
                return new Coordinate(this.row - 1, this.column);
            case MoveDirection.Down:
                return new Coordinate(this.row + 1, this.column);
        }
    }
}
