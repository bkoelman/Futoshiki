import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { SetFacilities } from '../set-facilities';
import { NamedSequence } from '../models/named-sequence';

export abstract class NakedSetStrategy extends SolverStrategy {
    abstract readonly powerSets: ReadonlySet<ReadonlySet<number>>[];

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

    private runAtSequences(sequences: NamedSequence[], singleCoordinate: Coordinate | undefined): boolean {
        for (const powerSet of this.powerSets) {
            for (const digitSet of powerSet) {
                for (const sequence of sequences) {
                    if (this.runAtSequence(sequence, digitSet, singleCoordinate)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private runAtSequence(sequence: NamedSequence, digitSet: ReadonlySet<number>, singleCoordinate: Coordinate | undefined): boolean {
        const nakedSetMembers = this.getMembersOfNakedSetInSequence(digitSet, sequence.coordinates);
        if (nakedSetMembers.length === digitSet.size) {
            const otherCells = sequence.coordinates.filter(coordinate => !nakedSetMembers.some(member => member.isEqualTo(coordinate)));
            return this.removeCandidatesFromOtherCells(otherCells, digitSet, nakedSetMembers, sequence.name, singleCoordinate);
        }

        return false;
    }

    private getMembersOfNakedSetInSequence(digitSet: ReadonlySet<number>, sequence: Coordinate[]): Coordinate[] {
        const memberCoordinates: Coordinate[] = [];

        for (const coordinate of sequence) {
            const cell = this.board.getCell(coordinate);
            if (cell) {
                const candidates = cell.getCandidates();
                const digitsInsideSet = SetFacilities.filterSet(candidates, digit => digitSet.has(digit));
                const digitsOutsideSet = SetFacilities.filterSet(candidates, digit => !digitSet.has(digit));

                if (digitsInsideSet.size > 0 && digitsOutsideSet.size === 0) {
                    memberCoordinates.push(coordinate);
                }
            }
        }

        return memberCoordinates;
    }

    private removeCandidatesFromOtherCells(otherCells: Coordinate[], digitsToRemove: ReadonlySet<number>, nakedSetMembers: Coordinate[],
        sequenceName: string, singleCoordinate: Coordinate | undefined): boolean {

        if (singleCoordinate !== undefined) {
            otherCells = otherCells.filter(coordinate => coordinate.isEqualTo(singleCoordinate));
        }

        let changedCellCount = 0;
        for (const coordinate of otherCells) {
            if (this.removeCandidatesFromCell(coordinate, digitsToRemove) > 0) {
                changedCellCount++;
            }
        }

        if (changedCellCount > 0) {
            const arity = this.getArityName(digitsToRemove.size);
            const source = singleCoordinate === undefined ?
                `${changedCellCount} other cells in that ${sequenceName}.` : `${singleCoordinate}.`;
            this.reportChange(`Naked ${arity} (${SetFacilities.formatSet(digitsToRemove)}) in cells (${nakedSetMembers}) eliminated ` +
                `${SetFacilities.formatSet(digitsToRemove)} from ${source}`);

            return true;
        }

        return false;
    }
}
