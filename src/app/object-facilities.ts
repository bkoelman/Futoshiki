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

    static createPowerSet<T>(set: T[]): T[][] {
        // Based on https://www.mathsisfun.com/sets/power-set-maker.html

        if (set.length === 0) {
            return [[]];
        }

        const answer: T[][] = [];
        const bitArray: number[] = [0];
        const cardinality = Math.pow(2, set.length);

        for (let index = 0; index < cardinality; index++) {
            const subset: T[] = [];
            for (let setIndex = 0; setIndex < set.length; setIndex++) {
                if (bitArray[setIndex] === 1) {
                    subset.push(set[setIndex]);
                }
            }

            answer.push(subset);
            ObjectFacilities.incrementBitArray(bitArray, 0);
        }

        return answer;
    }

    private static incrementBitArray(bitArray: number[], index): void {
        if (bitArray.length <= index) {
            bitArray.push(1);
        } else if (bitArray[index] === 1) {
            bitArray[index] = 0;
            ObjectFacilities.incrementBitArray(bitArray, index + 1);
        } else {
            bitArray[index] = 1;
        }
    }

    static removeArrayElement<T>(source: T[], itemToRemove: T, comparison: (self: T, other: T) => boolean): boolean {
        let removeAtIndex;
        source.find((item, index) => {
            const found = comparison(itemToRemove, item);
            if (found) {
                removeAtIndex = index;
            }
            return found;
        });

        if (removeAtIndex !== undefined) {
            source.splice(removeAtIndex, 1);
            return true;
        }

        return false;
    }

    static getUniqueArrayElements<T>(source: T[]): T[] {
        return source.filter((value, index, self) => self.indexOf(value) === index);
    }

    static repeat(count: number, action: () => void): void {
        for (let index = 0; index < count; index++) {
            action();
        }
    }
}
