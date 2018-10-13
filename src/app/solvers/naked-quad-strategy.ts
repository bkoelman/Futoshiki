import { NakedSetStrategy } from './naked-set-strategy';
import { SetFacilities } from '../set-facilities';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { BoardSizeBasedCache } from '../boardsizebasedcache';

export class NakedQuadStrategy extends NakedSetStrategy {
    private _powerSetForQuadsCache = new BoardSizeBasedCache(this.board, () =>
        SetFacilities.filterSet(this.powerSetForAllCellValues, set => set.size === 4));

    private get powerSetForQuads() {
        return this._powerSetForQuadsCache.value;
    }

    constructor(board: Board) {
        super('Naked Quad', board);
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
        for (const digitSet of this.powerSetForQuads) {
            for (const sequence of sequences) {
                if (this.runAtSequence(digitSet, sequence.coordinates, sequence.name, coordinate)) {
                    return true;
                }
            }
        }

        return false;
    }
}
