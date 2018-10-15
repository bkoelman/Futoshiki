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
import { NakedQuadStrategy } from './solvers/naked-quad-strategy';
import { HiddenPairTripleStrategy } from './solvers/hidden-pair-triple-strategy';

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
            new NakedQuadStrategy(this._board),
        ];
    }

    get explanationText(): string {
        return this._lastExplanationText;
    }

    runAtBoard(): boolean {
        return this.runStrategies(strategy => strategy.runAtBoard());
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        return this.runStrategies(strategy => strategy.runAtCoordinate(coordinate));
    }

    private runStrategies(runStrategy: (strategy: SolverStrategy) => boolean) {
        if (this.isBoardValid()) {
            for (const strategy of this._strategies) {
                console.log('[Debug] Running next strategy: ' + strategy.name);
                const hasChanges = runStrategy(strategy);

                if (hasChanges) {
                    if (!this.isBoardValid()) {
                        // TODO: Notify user about invalid board.
                        throw new Error('Strategy caused an invalid board.');
                    }

                    this._lastExplanationText = strategy.explanationText;
                    return true;
                }
            }
        }

        this._lastExplanationText = '';
        return false;
    }

    private isBoardValid() {
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
