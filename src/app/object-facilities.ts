export class ObjectFacilities {
  static createNumberSequence(count: number, startAt: number = 1): number[] {
    return Array.apply(undefined, Array(count)).map((item: number, index: number) => index + startAt);
  }

  static iterateObjectProperties<T>(obj: { [name: string]: T }, callback: (name: string, value: T) => void) {
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

  private static incrementBitArray(bitArray: number[], index: number) {
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

  static repeat(count: number, action: () => void) {
    for (let index = 0; index < count; index++) {
      action();
    }
  }

  static formatArray<T>(array: T[]): string {
    if (array.length === 1) {
      return array.join('');
    } else if (array.length === 2) {
      return array.join(' and ');
    } else if (array.length > 2) {
      return array.slice(0, -1).join(', ') + ' and ' + array.slice(-1).join('');
    } else {
      return '';
    }
  }
}
