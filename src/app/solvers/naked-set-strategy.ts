import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { SetFacilities } from '../set-facilities';
import { BoardSizeBasedCache } from '../boardsizebasedcache';

export abstract class NakedSetStrategy extends SolverStrategy {
    private _powerSetForAllCellValuesCache = new BoardSizeBasedCache(this.board, () => SetFacilities.createPowerSet(this.allCellValues));

    protected get powerSetForAllCellValues() {
        return this._powerSetForAllCellValuesCache.value;
    }

    protected runAtSequence(digitSet: ReadonlySet<number>, sequence: Coordinate[], sequenceName: string,
        singleCell: Coordinate | undefined): boolean {
        const nakedSetMembers = this.getMembersOfNakedSetInSequence(digitSet, sequence);
        if (nakedSetMembers.length === digitSet.size) {
            let otherCells = sequence.filter(coordinate => !nakedSetMembers.some(member => member.isEqualTo(coordinate)));

            if (singleCell !== undefined) {
                otherCells = otherCells.filter(coordinate => coordinate.isEqualTo(singleCell));
            }

            return this.removeCandidatesFromOtherCells(otherCells, digitSet, nakedSetMembers, sequenceName);
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
        sequenceName: string): boolean {

        let changedCellCount = 0;
        for (const coordinate of otherCells) {
            if (this.removeCandidatesFromCell(coordinate, digitsToRemove) > 0) {
                changedCellCount++;
            }
        }

        if (changedCellCount > 0) {
            const name = digitsToRemove.size === 2 ? 'Naked pair' : digitsToRemove.size === 3 ? 'Naked triple' : 'Naked quad';
            this.reportChange(`${name} (${SetFacilities.formatSet(digitsToRemove)}) in cells (${nakedSetMembers}) eliminated ` +
                `${SetFacilities.formatSet(digitsToRemove)} from ${changedCellCount} other cells in that ${sequenceName}.`);

            return true;
        }

        return false;
    }
}
