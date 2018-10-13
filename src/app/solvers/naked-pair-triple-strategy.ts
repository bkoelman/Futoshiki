import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { NakedSetStrategy } from './naked-set-strategy';

export class NakedPairTripleStrategy extends NakedSetStrategy {
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

    private runAtSequences(sequences: { coordinates: Coordinate[], name: string }[], singleCoordinate: Coordinate | undefined) {
        for (const powerSet of [this.powerSetForPairs, this.powerSetForTriples]) {
            for (const digitSet of powerSet) {
                for (const sequence of sequences) {
                    if (this.runAtSequence(digitSet, sequence.coordinates, sequence.name, singleCoordinate)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
