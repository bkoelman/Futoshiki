import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { MoveCheckResult } from './models/move-check-result';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';

export class MoveChecker {
  constructor(private _board: Board) {}

  checkIsMoveAllowed(digit: number, coordinate: Coordinate): MoveCheckResult {
    const coordinateSequence = this.getCoordinatesInRowColumn(coordinate);

    const violatingCoordinates = this.getViolatingCoordinatesInSequence(coordinateSequence, digit);
    const violatingOperators = this.getViolatingCoordinatesForOperators(coordinate, digit);

    return new MoveCheckResult(violatingCoordinates, violatingOperators);
  }

  private getCoordinatesInRowColumn(coordinate: Coordinate): Coordinate[] {
    const coordinatesInRow = coordinate.iterateRow(true);
    const coordinatesInColumn = coordinate.iterateColumn(true);
    return coordinatesInRow.concat(coordinatesInColumn);
  }

  private getViolatingCoordinatesInSequence(sequence: Coordinate[], digit: number): Coordinate[] {
    const violations: Coordinate[] = [];

    for (const coordinate of sequence) {
      const cell = this._board.getCell(coordinate);
      if (cell && cell.value === digit) {
        violations.push(coordinate);
      }
    }

    return violations;
  }

  private getViolatingCoordinatesForOperators(coordinate: Coordinate, digit: number): MoveDirection[] {
    const violations: MoveDirection[] = [];

    for (const directionPair of [[MoveDirection.Left, MoveDirection.Right], [MoveDirection.Up, MoveDirection.Down]]) {
      if (!this.isOperatorPairAllowed(coordinate, directionPair[0], directionPair[1], digit)) {
        violations.push(directionPair[0]);
        violations.push(directionPair[1]);
      } else {
        for (const direction of directionPair) {
          if (!this.isSingleOperatorAllowed(coordinate, direction, digit)) {
            violations.push(direction);
          }
        }
      }
    }

    return violations;
  }

  private isOperatorPairAllowed(coordinate: Coordinate, direction1: MoveDirection, direction2: MoveDirection, digit: number): boolean {
    if (coordinate.canMoveOne(direction1) && coordinate.canMoveOne(direction2)) {
      const operator1 = this._board.getOperator(coordinate, direction1);
      const operator2 = this._board.getOperator(coordinate, direction2);

      if (operator1 !== ComparisonOperator.None && operator1 === operator2) {
        const adjacentCoordinate1 = coordinate.moveOne(direction1);
        const adjacentCoordinate2 = coordinate.moveOne(direction2);
        const adjacentCell1 = this._board.getCell(adjacentCoordinate1);
        const adjacentCell2 = this._board.getCell(adjacentCoordinate2);

        if (adjacentCell1 && adjacentCell2) {
          if (operator1 === ComparisonOperator.LessThan) {
            const adjacentMaxValue = this._board.size - 1;
            if (digit >= adjacentMaxValue) {
              return false;
            }
          } else {
            const adjacentMinValue = 2;
            if (digit <= adjacentMinValue) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private isSingleOperatorAllowed(coordinate: Coordinate, direction: MoveDirection, digit: number): boolean {
    if (coordinate.canMoveOne(direction)) {
      const operator = this._board.getOperator(coordinate, direction);
      if (operator !== ComparisonOperator.None) {
        const adjacentCoordinate = coordinate.moveOne(direction);
        const adjacentCell = this._board.getCell(adjacentCoordinate);

        if (adjacentCell) {
          if (operator === ComparisonOperator.LessThan) {
            const adjacentMaxValue = adjacentCell.value || this._board.size;
            if (digit >= adjacentMaxValue) {
              return false;
            }
          } else {
            const adjacentMinValue = adjacentCell.value || 1;
            if (digit <= adjacentMinValue) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }
}
