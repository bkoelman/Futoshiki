import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { SolverStrategy } from './solvers/solver-strategy';
import { OperatorWithHiddenSingleStrategy } from './solvers/operator-with-hidden-single-strategy';
import { NakedSingleStrategy } from './solvers/naked-single-strategy';
import { MoveChecker } from './move-checker';

export class HintProvider {
    private _checker: MoveChecker;
    private _strategies: SolverStrategy[];

    constructor(private _board: Board) {
        this._checker = new MoveChecker(this._board);
        this._strategies = [
            new NakedSingleStrategy(this._board),
            new OperatorWithHiddenSingleStrategy(this._board)
        ];
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
                console.log('Running next strategy: ' + strategy.name);
                const hasChanges = runStrategy(strategy);

                if (hasChanges) {
                    if (!this.isBoardValid()) {
                        throw new Error('Strategy caused an invalid board.');
                    }

                    return true;
                }
            }
        }

        console.log('Hint is not available.');
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
