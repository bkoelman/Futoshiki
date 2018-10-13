import { NakedSetStrategy } from './naked-set-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';

export class NakedQuadStrategy extends NakedSetStrategy {
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

    private runAtSequences(sequences: { coordinates: Coordinate[], name: string }[], singleCoordinate: Coordinate | undefined) {
        for (const digitSet of this.powerSetForQuads) {
            for (const sequence of sequences) {
                if (this.runAtSequence(digitSet, sequence.coordinates, sequence.name, singleCoordinate)) {
                    return true;
                }
            }
        }

        return false;
    }
}
