import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';

export class XWingStrategy extends SolverStrategy {
  constructor(board: Board) {
    super('X-Wing', board);
  }

  runAtBoard(): boolean {
    return this.innerRun(undefined);
  }

  runAtCoordinate(coordinate: Coordinate): boolean {
    return this.innerRun(coordinate);
  }

  private innerRun(singleCoordinate: Coordinate | undefined): boolean {
    for (const digit of this.allCellValues) {
      const cells = this.getCellsContainingDigit(digit);

      if (this.runAtRows(digit, cells.slice(), singleCoordinate) || this.runAtColumns(digit, cells.slice(), singleCoordinate)) {
        return true;
      }
    }

    return false;
  }

  private runAtRows(digit: number, cells: Coordinate[], singleCoordinate: Coordinate | undefined): boolean {
    while (cells.length > 3) {
      const rowName1 = cells[0].toString()[0];
      const cellsInRow1 = cells.filter(coordinate => coordinate.toString()[0] === rowName1);

      if (cellsInRow1.length === 2) {
        const columnName1 = cellsInRow1[0].toString()[1];
        const columnName2 = cellsInRow1[1].toString()[1];

        const othersInColumn1 = cells.filter(coordinate => {
          const text = coordinate.toString();
          return text[0] !== rowName1 && text[1] === columnName1;
        });

        for (const nextInColumn1 of othersInColumn1) {
          const rowName2 = nextInColumn1.toString()[0];
          const cellsInRow2 = cells.filter(coordinate => coordinate.toString()[0] === rowName2);

          if (cellsInRow2.length === 2 && cellsInRow2[1].toString()[1] === columnName2) {
            const xWingInfo = new XWingInfo(cellsInRow1.concat(cellsInRow2), digit, 'column', singleCoordinate);
            if (this.removeCandidatesFromOtherCells(xWingInfo)) {
              return true;
            }
          }

          for (const cellToRemove of cellsInRow2) {
            ObjectFacilities.removeArrayElement(cells, cellToRemove, Coordinate.areEqual);
          }
        }
      }

      for (const cellToRemove of cellsInRow1) {
        ObjectFacilities.removeArrayElement(cells, cellToRemove, Coordinate.areEqual);
      }
    }

    return false;
  }

  private runAtColumns(digit: number, cells: Coordinate[], singleCoordinate: Coordinate | undefined): boolean {
    while (cells.length > 3) {
      const columnName1 = cells[0].toString()[1];
      const cellsInColumn1 = cells.filter(coordinate => coordinate.toString()[1] === columnName1);

      if (cellsInColumn1.length === 2) {
        const rowName1 = cellsInColumn1[0].toString()[0];
        const rowName2 = cellsInColumn1[1].toString()[0];

        const othersInRow1 = cells.filter(coordinate => {
          const text = coordinate.toString();
          return text[0] === rowName1 && text[1] !== columnName1;
        });

        for (const nextInRow1 of othersInRow1) {
          const columnName2 = nextInRow1.toString()[1];
          const cellsInColumn2 = cells.filter(coordinate => coordinate.toString()[1] === columnName2);

          if (cellsInColumn2.length === 2 && cellsInColumn2[1].toString()[0] === rowName2) {
            const xWingInfo = new XWingInfo(cellsInColumn1.concat(cellsInColumn2), digit, 'row', singleCoordinate);
            if (this.removeCandidatesFromOtherCells(xWingInfo)) {
              return true;
            }
          }

          for (const cellToRemove of cellsInColumn2) {
            ObjectFacilities.removeArrayElement(cells, cellToRemove, Coordinate.areEqual);
          }
        }
      }

      for (const cellToRemove of cellsInColumn1) {
        ObjectFacilities.removeArrayElement(cells, cellToRemove, Coordinate.areEqual);
      }
    }

    return false;
  }

  private getCellsContainingDigit(digit: number): Coordinate[] {
    const coordinates: Coordinate[] = [];

    for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
      const cell = this.board.getCell(coordinate);
      if (cell) {
        if (cell.containsCandidate(digit)) {
          coordinates.push(coordinate);
        }
      }
    }

    return coordinates;
  }

  private removeCandidatesFromOtherCells(info: XWingInfo): boolean {
    const digitsToRemove = new Set<number>([info.digit]);
    const changedCellCount = this.removeCandidatesFromCells(info.cellsToUpdate, digitsToRemove);

    if (changedCellCount > 0) {
      const message = info.getMessage(changedCellCount);
      this.reportChange(message);

      return true;
    }

    return false;
  }
}

class XWingInfo {
  get cellsToUpdate(): Coordinate[] {
    const cells = this.sequenceName === 'row' ? this.getCellsInRowsToUpdate() : this.getCellsInColumnsToUpdate();

    if (this.singleCoordinate !== undefined) {
      const singleCoordinate = this.singleCoordinate;
      return cells.filter(coordinate => coordinate.isEqualTo(singleCoordinate));
    }

    return cells;
  }

  constructor(
    readonly cellsInXWing: Coordinate[],
    readonly digit: number,
    readonly sequenceName: string,
    readonly singleCoordinate: Coordinate | undefined
  ) {}

  private getCellsInRowsToUpdate(): Coordinate[] {
    const otherCellsInRow1 = this.cellsInXWing[0].iterateRow(true).filter(coordinate => !coordinate.isEqualTo(this.cellsInXWing[2]));
    const otherCellsInRow2 = this.cellsInXWing[1].iterateRow(true).filter(coordinate => !coordinate.isEqualTo(this.cellsInXWing[3]));
    return otherCellsInRow1.concat(otherCellsInRow2);
  }

  private getCellsInColumnsToUpdate(): Coordinate[] {
    const otherCellsInColumn1 = this.cellsInXWing[0].iterateColumn(true).filter(coordinate => !coordinate.isEqualTo(this.cellsInXWing[2]));
    const otherCellsInColumn2 = this.cellsInXWing[1].iterateColumn(true).filter(coordinate => !coordinate.isEqualTo(this.cellsInXWing[3]));
    return otherCellsInColumn1.concat(otherCellsInColumn2);
  }

  getMessage(changedCellCount: number): string {
    const range = `(${this.cellsInXWing[0]},${this.cellsInXWing[1]},${this.cellsInXWing[2]},${this.cellsInXWing[3]})`;
    const target = this.singleCoordinate === undefined ? `${changedCellCount} other cells in ${this.sequenceName}s` : `${this.singleCoordinate}`;
    return `X-Wing of (${this.digit}) in ${range} eliminates '${this.digit}' from ${target}.`;
  }
}
