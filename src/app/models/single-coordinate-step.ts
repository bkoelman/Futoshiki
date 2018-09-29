import { Coordinate } from './coordinate';

export class SingleCoordinateStep {
    readonly from: Coordinate;
    readonly to: Coordinate;

    constructor(from: Coordinate, to: Coordinate) {
        this.from = from;
        this.to = to;
    }

    reverse(): SingleCoordinateStep {
        return new SingleCoordinateStep(this.to, this.from);
    }

    isEqualTo(other: SingleCoordinateStep): boolean {
        return other && this.from.isEqualTo(other.from) && this.to.isEqualTo(other.to);
    }
}
