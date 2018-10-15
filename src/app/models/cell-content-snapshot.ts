import { SetFacilities } from '../set-facilities';

export class CellContentSnapshot {
    private static readonly _emptySnapshot = new CellContentSnapshot(undefined, SetFacilities.emptyNumberSet);

    public readonly candidates: ReadonlySet<number>;

    constructor(public readonly userValue: number | undefined, candidates: ReadonlySet<number>) {
        this.candidates = SetFacilities.sortSet(candidates);
    }

    static empty(): CellContentSnapshot {
        return CellContentSnapshot._emptySnapshot;
    }

    static fromUserValue(userValue: number): CellContentSnapshot {
        return new CellContentSnapshot(userValue, SetFacilities.emptyNumberSet);
    }

    static fromCandidates(candidates: ReadonlySet<number>): CellContentSnapshot {
        return new CellContentSnapshot(undefined, candidates);
    }

    isEqualTo(other: CellContentSnapshot) {
        const thisCandidates = [...this.candidates];
        const otherCandidates = [...other.candidates];
        return this.userValue === other.userValue && JSON.stringify(thisCandidates) === JSON.stringify(otherCandidates);
    }
}
