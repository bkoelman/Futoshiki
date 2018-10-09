import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { GameSettings } from './models/game-settings';
import { SolverStrategy } from './solvers/solver-strategy';
import { SetDraftValuesStrategy } from './solvers/set-draft-values-strategy';
import { PromoteSingleDraftValueStrategy } from './solvers/promote-single-draft-value-strategy';
import { MoveChecker } from './move-checker';

export class HintProvider {
    private _checker: MoveChecker;
    private _strategies: SolverStrategy[];

    constructor(private _board: Board) {
        this._checker = new MoveChecker(this._board);
        this._strategies = [
            new PromoteSingleDraftValueStrategy(this._board),
            new SetDraftValuesStrategy(this._board)
        ];
    }

    runAtBoard(settings: GameSettings): boolean {
        return this.runStrategies(strategy => strategy.runAtBoard(settings));
    }

    runAtCoordinate(coordinate: Coordinate, settings: GameSettings): boolean {
        return this.runStrategies(strategy => strategy.runAtCoordinate(coordinate, settings));
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
