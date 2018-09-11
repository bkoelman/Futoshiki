import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
 })
export class NumberSequenceService {
  createNumberSequence(count: number): number[] {
    return Array.apply(undefined, Array(count)).map((item, index) => index + 1);
  }
}
