export class CellContentSnapshot {
    private static _emptySnapshot = new CellContentSnapshot(undefined, []);

    constructor(public userValue: number | undefined, public draftValues: number[]) {
    }

    static empty(): CellContentSnapshot {
        return CellContentSnapshot._emptySnapshot;
    }

    isEqualTo(other: CellContentSnapshot) {
        return JSON.stringify(this) === JSON.stringify(other);
    }
}
