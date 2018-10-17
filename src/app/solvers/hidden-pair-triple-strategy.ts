import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';
import { NamedSequence } from '../models/named-sequence';

export class HiddenPairTripleStrategy extends SolverStrategy {
  constructor(board: Board) {
    super('Hidden Pair/Triple', board);
  }

  runAtBoard(): boolean {
    return this.runAtSequences(this.rowColumnSequences, undefined);
  }

  runAtCoordinate(coordinate: Coordinate): boolean {
    const sequences = this.getSequencesForCoordinate(coordinate, false);
    return this.runAtSequences(sequences, coordinate);
  }

  private runAtSequences(sequences: NamedSequence[], singleCoordinate: Coordinate | undefined) {
    for (const powerSet of [this.powerSetForPairs, this.powerSetForTriples]) {
      for (const digitSet of powerSet) {
        for (const sequence of sequences) {
          if (this.runAtSequence(sequence, digitSet, singleCoordinate)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private runAtSequence(sequence: NamedSequence, digitSet: ReadonlySet<number>, singleCoordinate: Coordinate | undefined) {
    const cellsInHiddenSet = this.getCellsInHiddenSet(sequence.coordinates, digitSet);

    if (cellsInHiddenSet.length === digitSet.size) {
      const hiddenSetInfo = new HiddenSetInfo(cellsInHiddenSet, digitSet, sequence.name, singleCoordinate);
      return this.removeOtherCandidatesFromCells(hiddenSetInfo);
    }

    return false;
  }

  private getCellsInHiddenSet(sequence: Coordinate[], digitSet: ReadonlySet<number>): Coordinate[] {
    const cellsInHiddenSet: Coordinate[] = [];

    for (const coordinate of sequence) {
      const isInSet = this.isCellInHiddenSet(coordinate, digitSet);
      if (isInSet === true) {
        cellsInHiddenSet.push(coordinate);
      } else if (isInSet === undefined) {
        return [];
      }
    }

    return cellsInHiddenSet;
  }

  private isCellInHiddenSet(coordinate: Coordinate, digitSet: ReadonlySet<number>): boolean | undefined {
    const possibleDigits = this.getPossibleDigitsForCell(coordinate);

    let foundCount = 0;
    for (const digit of digitSet) {
      if (possibleDigits.has(digit)) {
        foundCount++;
      }
    }

    if (foundCount === digitSet.size) {
      return true;
    } else if (foundCount === 0) {
      return false;
    } else {
      return undefined;
    }
  }

  private removeOtherCandidatesFromCells(info: HiddenSetInfo): boolean {
    const digitsToRemove = SetFacilities.filterSet(this.allCellValues, digit => !info.digitsToKeep.has(digit));
    const changedCellCount = this.removeCandidatesFromCells(info.cellsToUpdate, digitsToRemove);

    if (changedCellCount > 0) {
      const setArity = this.getArityName(info.digitsToKeep.size);
      const message = info.getMessage(setArity);
      this.reportChange(message);

      return true;
    }

    return false;
  }
}

class HiddenSetInfo {
  get cellsToUpdate(): Coordinate[] {
    if (this.singleCoordinate !== undefined) {
      const singleCoordinate = this.singleCoordinate;
      return this.cellsInHiddenSet.filter(coordinate => coordinate.isEqualTo(singleCoordinate));
    }
    return this.cellsInHiddenSet;
  }

  constructor(
    readonly cellsInHiddenSet: Coordinate[],
    readonly digitsToKeep: ReadonlySet<number>,
    readonly sequenceName: string,
    readonly singleCoordinate: Coordinate | undefined
  ) {}

  getMessage(setArity: string): string {
    const digitsInSet = SetFacilities.formatSet(this.digitsToKeep);
    const target = this.singleCoordinate === undefined ? 'these cells' : `${this.singleCoordinate}`;
    return `Hidden ${setArity} (${digitsInSet}) in ${this.sequenceName} of cells (${this.cellsInHiddenSet}) eliminated others in ${target}.`;
  }
}
