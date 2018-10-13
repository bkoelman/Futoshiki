import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';
import { NakedSetStrategy } from './naked-set-strategy';

export class NakedPairTripleStrategy extends NakedSetStrategy {
    private _boardSizeCached = -1;
    private _powerSetForPairs = SetFacilities.emptyNumberSetOfSet;
    private _powerSetForTriples = SetFacilities.emptyNumberSetOfSet;

    private get powerSetForPairs() {
        this.ensureCache();
        return this._powerSetForPairs;
    }

    private get powerSetForTriples() {
        this.ensureCache();
        return this._powerSetForTriples;
    }

    private ensureCache() {
        if (this._boardSizeCached !== this.board.size) {
            this._powerSetForPairs = SetFacilities.filterSet(this.powerSetForAllCellValues, set => set.size === 2);
            this._powerSetForTriples = SetFacilities.filterSet(this.powerSetForAllCellValues, set => set.size === 3);

            this._boardSizeCached = this.board.size;
        }
    }

    constructor(board: Board) {
        super('Naked Pair/Triple', board);
    }

    runAtBoard(): boolean {
        this.ensureCache();

        return this.runAtSequences(this.rowColumnSequences, undefined);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        this.ensureCache();

        const sequences = [{
            coordinates: coordinate.iterateRow(false),
            name: 'row'
        }, {
            coordinates: coordinate.iterateColumn(false),
            name: 'column'
        }];

        return this.runAtSequences(sequences, coordinate);
    }

    private runAtSequences(sequences: { coordinates: Coordinate[], name: string }[], coordinate: Coordinate | undefined) {
        for (const powerSet of [this.powerSetForPairs, this.powerSetForTriples]) {
            for (const digitSet of powerSet) {
                for (const sequence of sequences) {
                    if (this.runAtSequence(digitSet, sequence.coordinates, sequence.name, coordinate)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
