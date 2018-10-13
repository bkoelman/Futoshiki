import { ObjectFacilities } from './object-facilities';

export class SetFacilities {
    static readonly emptyNumberSet: ReadonlySet<number> = new Set<number>();
    static readonly emptyNumberSetOfSet: ReadonlySet<ReadonlySet<number>> = new Set<Set<number>>();

    static createNumberSet(count: number, startAt: number = 1): ReadonlySet<number> {
        return new Set<number>(ObjectFacilities.createNumberSequence(count, startAt));
    }

    static createPowerSet<T>(set: ReadonlySet<T>): ReadonlySet<ReadonlySet<T>> {
        const sets = new Set<Set<T>>();

        for (const entry of ObjectFacilities.createPowerSet([...set])) {
            sets.add(new Set<T>(entry));
        }

        return sets;
    }

    static filterSet<T>(source: ReadonlySet<T>, callbackfn: (value: T, index: number, set: ReadonlySet<T>) => boolean,
        thisArg?: any): Set<T> {
        const filtered = new Set<T>();
        let index = 0;
        source.forEach((value, value2, outerThisArg) => {
            if (callbackfn(value, index, outerThisArg)) {
                filtered.add(value);
            }
            index++;
        }, thisArg || source);
        return filtered;
    }

    static formatSet<T>(set: ReadonlySet<T>): string {
        let text = '';

        let isFirstItem = true;
        set.forEach(value => {
            if (isFirstItem) {
                isFirstItem = false;
            } else {
                text += ',';
            }

            text += `${value}`;
        });

        return text;
    }
}
