import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NumberSequenceService {
  createNumberSequence(count: number, startAt: number = 1): number[] {
    return Array.apply(undefined, Array(count)).map((item, index) => index + startAt);
  }
}
