import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';
import { BoardSizeBasedCache } from '../board-size-based-cache';
import { NamedSequence } from '../models/named-sequence';
import { Logger } from '../logger';
import { LogCategory } from '../models/log-category.enum';

export abstract class SolverStrategy {
  private readonly _allCellValuesCache = new BoardSizeBasedCache(this.board, () => SetFacilities.createNumberSet(this.board.size));
  private readonly _rowColumnSequencesCache = new BoardSizeBasedCache(this.board, () => this.getRowColumnSequences());
  private readonly _powerSetForAllCellValuesCache = new BoardSizeBasedCache(this.board, () => SetFacilities.createPowerSet(this.allCellValues));
  private readonly _powerSetForPairsCache = new BoardSizeBasedCache(this.board, () =>
    SetFacilities.filterSet(this._powerSetForAllCellValuesCache.value, set => set.size === 2)
  );
  private readonly _powerSetForTriplesCache = new BoardSizeBasedCache(this.board, () =>
    SetFacilities.filterSet(this._powerSetForAllCellValuesCache.value, set => set.size === 3)
  );
  private readonly _powerSetForQuadsCache = new BoardSizeBasedCache(this.board, () =>
    SetFacilities.filterSet(this._powerSetForAllCellValuesCache.value, set => set.size === 4)
  );

  private _lastExplanationText = '';

  protected get allCellValues() {
    return this._allCellValuesCache.value;
  }

  protected get rowColumnSequences() {
    return this._rowColumnSequencesCache.value;
  }

  protected get powerSetForPairs() {
    return this._powerSetForPairsCache.value;
  }

  protected get powerSetForTriples() {
    return this._powerSetForTriplesCache.value;
  }

  protected get powerSetForQuads() {
    return this._powerSetForQuadsCache.value;
  }

  get explanationText() {
    return this._lastExplanationText;
  }

  protected constructor(readonly name: string, readonly board: Board) {}

  private getRowColumnSequences(): NamedSequence[] {
    const sequences: NamedSequence[] = [];

    const firstCoordinate = Coordinate.fromIndex(0, this.board.size);
    for (const firstColumnInRow of firstCoordinate.iterateColumn(false)) {
      const coordinatesInRow = firstColumnInRow.iterateRow(false);
      sequences.push({ coordinates: coordinatesInRow, name: 'row' });
    }

    for (const firstRowInColumn of firstCoordinate.iterateRow(false)) {
      const coordinatesInColumn = firstRowInColumn.iterateColumn(false);
      sequences.push({ coordinates: coordinatesInColumn, name: 'column' });
    }

    return sequences;
  }

  abstract runAtBoard(): boolean;
  abstract runAtCoordinate(coordinate: Coordinate): boolean;

  protected reportChange(message: string) {
    this._lastExplanationText = message;
  }

  protected reportVerbose(message: string) {
    Logger.write(LogCategory.Solvers, `[${this.name}] ${message}`);
  }

  protected getSequencesForCoordinate(coordinate: Coordinate, skipSelf: boolean) {
    return [
      {
        coordinates: coordinate.iterateRow(skipSelf),
        name: 'row'
      },
      {
        coordinates: coordinate.iterateColumn(skipSelf),
        name: 'column'
      }
    ];
  }

  protected getPossibleDigitsForCell(coordinate: Coordinate): ReadonlySet<number> {
    const cell = this.board.getCell(coordinate);
    if (cell) {
      if (cell.value !== undefined) {
        return new Set([cell.value]);
      }

      const candidates = cell.getCandidates();
      if (candidates.size > 0) {
        return candidates;
      }
    }

    return this.allCellValues;
  }

  protected getArityName(count: number) {
    switch (count) {
      case 1:
        return 'single';
      case 2:
        return 'pair';
      case 3:
        return 'triple';
      case 4:
        return 'quad';
      default:
        return 'set';
    }
  }

  protected removeCandidateFromCell(coordinate: Coordinate, digitToRemove: number): boolean {
    const cell = this.board.getCell(coordinate);
    if (cell && cell.value === undefined) {
      const candidates = cell.getCandidates();
      if (candidates.has(digitToRemove)) {
        if (candidates.size === 1) {
          throw new Error(`No possible digits for ${coordinate}.`);
        }

        cell.removeCandidate(digitToRemove);
        return true;
      }
    }

    return false;
  }

  protected removeCandidatesFromCell(coordinate: Coordinate, digitsToRemove: ReadonlySet<number>): number {
    let removedCandidateCount = 0;

    for (const digitToRemove of digitsToRemove) {
      if (this.removeCandidateFromCell(coordinate, digitToRemove)) {
        removedCandidateCount++;
      }
    }

    return removedCandidateCount;
  }

  protected removeCandidatesFromCells(coordinates: Coordinate[], digitsToRemove: ReadonlySet<number>): number {
    let changedCellCount = 0;

    for (const coordinate of coordinates) {
      if (this.removeCandidatesFromCell(coordinate, digitsToRemove) > 0) {
        changedCellCount++;
      }
    }

    return changedCellCount;
  }
}
