export class CellContentSnapshot {
    constructor(public userValue: number | undefined, public draftValues: number[]) {
    }

    isEqualTo(other: CellContentSnapshot) {
        return JSON.stringify(this) === JSON.stringify(other);
    }
}
