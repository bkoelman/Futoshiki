import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'repeat'
})
export class RepeatPipe implements PipeTransform {
  transform(value: number): any {
    return {
      [Symbol.iterator]: function*() {
        let index = 0;
        while (index < value) {
          yield index++;
        }
      }
    };
  }
}
