import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';
import { NakedSetStrategy } from './naked-set-strategy';
import { BoardSizeBasedCache } from '../boardsizebasedcache';

export class NakedPairTripleStrategy extends NakedSetStrategy {
    private _powerSetForPairsCache = new BoardSizeBasedCache(this.board, () =>
        SetFacilities.filterSet(this.powerSetForAllCellValues, set => set.size === 2));
    private _powerSetForTriplesCache = new BoardSizeBasedCache(this.board, () =>
        SetFacilities.filterSet(this.powerSetForAllCellValues, set => set.size === 3));

    private get powerSetForPairs() {
        return this._powerSetForPairsCache.value;
    }

    private get powerSetForTriples() {
        return this._powerSetForTriplesCache.value;
    }

    constructor(board: Board) {
        super('Naked Pair/Triple', board);
    }

    runAtBoard(): boolean {
        return this.runAtSequences(this.rowColumnSequences, undefined);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
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
