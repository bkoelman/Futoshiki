import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumNamesToArray'
})
export class EnumNamesToArrayPipe implements PipeTransform {
  transform(value: any): string[] {
    const keys = Object.keys(value);
    return keys.slice(keys.length / 2);
  }
}
