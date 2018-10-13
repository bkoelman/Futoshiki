import { NakedSetStrategy } from './naked-set-strategy';
import { SetFacilities } from '../set-facilities';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';

export class NakedQuadStrategy extends NakedSetStrategy {
    private _boardSizeCached = -1;
    private _powerSetForQuads = SetFacilities.emptyNumberSetOfSet;

    private get powerSetForQuads() {
        this.ensureCache();
        return this._powerSetForQuads;
    }

    private ensureCache() {
        if (this._boardSizeCached !== this.board.size) {
            this._powerSetForQuads = SetFacilities.filterSet(this.powerSetForAllCellValues, set => set.size === 4);
            this._boardSizeCached = this.board.size;
        }
    }

    constructor(board: Board) {
        super('Naked Quad', board);
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
