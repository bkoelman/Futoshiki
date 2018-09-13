export class Coordinate {
    constructor(public row: number, public column: number) {
    }

    static fromIndex(index: number, boardSize: number): Coordinate {
        const row = Math.floor(index / boardSize) + 1;
        const column = (index % boardSize) + 1;
        return new Coordinate(row, column);
    }

    toIndex(boardSize: number): number {
        return (this.row - 1) * boardSize + this.column - 1;
    }

    moveLeft(): Coordinate {
        return new Coordinate(this.row, this.column - 1);
    }

    moveRight(): Coordinate {
        return new Coordinate(this.row, this.column + 1);
    }

    moveUp(): Coordinate {
        return new Coordinate(this.row - 1, this.column);
    }

    moveDown(): Coordinate {
        return new Coordinate(this.row + 1, this.column);
    }
}
