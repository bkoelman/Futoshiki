export class ObjectFacilities {
    static createNumberSequence(count: number, startAt: number = 1): number[] {
        return Array.apply(undefined, Array(count)).map((item, index) => index + startAt);
    }

    static iterateObjectProperties<TValue>(obj: Object, callback: (name: string, value: TValue) => void) {
        for (const propertyName in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, propertyName)) {
                const propertyValue = obj[propertyName];
                callback(propertyName, propertyValue);
            }
        }
    }

    static getRandomIntegerInRange(minInclusive: number, maxInclusive: number): number {
        return Math.floor(Math.random() * (maxInclusive - minInclusive + 1) + minInclusive);
    }
}
