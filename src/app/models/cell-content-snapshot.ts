export class CellContentSnapshot {
    private static _emptySnapshot = new CellContentSnapshot(undefined, []);

    constructor(public readonly userValue: number | undefined, public readonly draftValues: number[]) {
    }

    static empty(): CellContentSnapshot {
        return CellContentSnapshot._emptySnapshot;
    }

    static fromUserValue(userValue: number): CellContentSnapshot {
        return new CellContentSnapshot(userValue, []);
    }

    static fromDraftValues(draftValues: number[]): CellContentSnapshot {
        return new CellContentSnapshot(undefined, draftValues.sort());
    }

    isEqualTo(other: CellContentSnapshot) {
        return JSON.stringify(this) === JSON.stringify(other);
    }
}
