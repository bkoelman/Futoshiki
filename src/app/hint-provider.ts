import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { MoveChecker } from './move-checker';
import { SolverStrategy } from './solvers/solver-strategy';
import { SetCandidatesStrategy } from './solvers/set-candidates-strategy';
import { PromoteStrategy } from './solvers/promote-strategy';
import { NakedSingleStrategy } from './solvers/naked-single-strategy';
import { HiddenSingleStrategy } from './solvers/hidden-single-strategy';
import { OperatorsStrategy } from './solvers/operators-strategy';
import { NakedPairTripleStrategy } from './solvers/naked-pair-triple-strategy';
import { HiddenPairTripleStrategy } from './solvers/hidden-pair-triple-strategy';
import { NakedQuadStrategy } from './solvers/naked-quad-strategy';

export class HintProvider {
  private readonly _checker: MoveChecker;
  private readonly _strategies: SolverStrategy[];

  private _lastExplanationText = '';

  constructor(private _board: Board) {
    this._checker = new MoveChecker(this._board);
    this._strategies = [
      new SetCandidatesStrategy(this._board),
      new PromoteStrategy(this._board),
      new NakedSingleStrategy(this._board),
      new HiddenSingleStrategy(this._board),
      new OperatorsStrategy(this._board),
      new NakedPairTripleStrategy(this._board),
      new HiddenPairTripleStrategy(this._board),
      new NakedQuadStrategy(this._board)
    ];
  }

  get explanationText(): string {
    return this._lastExplanationText;
  }

  runAtBoard(): boolean {
    const hasChanges = this.runStrategies(strategy => strategy.runAtBoard());

    if (!hasChanges) {
      this._lastExplanationText = 'Hint is not available.';
    }

    return hasChanges;
  }

  runAtCoordinate(coordinate: Coordinate): boolean {
    let hasChanges = false;

    const cell = this._board.getCell(coordinate);
    if (cell && cell.value === undefined) {
      hasChanges = this.runStrategies(strategy => strategy.runAtCoordinate(coordinate));
    }

    if (!hasChanges) {
      this._lastExplanationText = 'Hint is not available for selected cell.';
    }

    return hasChanges;
  }

  private runStrategies(runStrategy: (strategy: SolverStrategy) => boolean): boolean {
    if (!this.isBoardValid()) {
      throw new Error('Solvers cannot run on an invalid board.');
    }

    for (const strategy of this._strategies) {
      const hasChanges = runStrategy(strategy);

      if (hasChanges) {
        if (!this.isBoardValid()) {
          throw new Error(`Strategy '${strategy.name}' caused an invalid board.`);
        }

        this._lastExplanationText = strategy.explanationText;
        return true;
      }
    }

    return false;
  }

  private isBoardValid(): boolean {
    for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
      const cell = this._board.getCell(coordinate);
      if (cell) {
        if (cell.value !== undefined) {
          const checkResult = this._checker.checkIsMoveAllowed(cell.value, coordinate);
          if (!checkResult.isValid) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
