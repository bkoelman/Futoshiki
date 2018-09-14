import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChildren, ElementRef, AfterViewChecked } from '@angular/core';
import { NumberSequenceService } from '../number-sequence.service.js';
import { CellContentSnapshot } from '../cell-content-snapshot.js';
import * as ft from '../../jquery.fittext.js';

declare var $: any;

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements OnInit, AfterViewChecked {
  @Input() boardSize = 4;
  @Input() fixedValue: number | undefined;
  @Input() isSelected: boolean;
  @Input() canSelect;
  @Output() cellClicked = new EventEmitter<DigitCellComponent>();

  @ViewChildren('autoSizeText') autoSizeTextRefs: ElementRef[];

  private userValue: number | undefined;
  private draftValues: number[] = [];

  get value(): number | undefined {
    return this.fixedValue !== undefined ? this.fixedValue : this.userValue;
  }

  get isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  get isDraft(): boolean {
    return !this.isFixed && this.draftValues.length > 0;
  }

  get isEmpty(): boolean {
    return !this.isDraft && this.value === undefined;
  }

  constructor(private _numberSequenceService: NumberSequenceService) {
  }

  ngOnInit() {
  }

  ngAfterViewChecked(): void {
    // TODO: Verify we are not binding too often
    this.registerAutoSizeText();
  }

  registerAutoSizeText() {
    this.autoSizeTextRefs.forEach(textRef => {
      const autoSizeTextTarget = $(textRef.nativeElement);
      autoSizeTextTarget.fitText(0.15);
    });
  }

  clear() {
    this.userValue = undefined;
    this.draftValues = [];
  }

  setUserValue(value: number) {
    this.userValue = value;
    this.draftValues = [];
  }

  toggleDraftValue(value: number) {
    if (this.draftValues.indexOf(value) >= 0) {
      this.draftValues = this.draftValues.filter(item => item !== value);
    } else {
      this.userValue = undefined;
      this.draftValues.push(value);
      this.draftValues.sort();
    }
  }

  getContentSnapshot(): CellContentSnapshot {
    return {
      userValue: this.userValue,
      draftValues: this.draftValues.slice()
    };
  }

  restoreContentSnapshot(snapshot: CellContentSnapshot) {
    this.draftValues = snapshot.draftValues.slice();
    this.userValue = snapshot.userValue;
  }

  getSingleValue(): number | undefined {
    let result = this.value;

    if (result === undefined) {
      if (this.draftValues.length === 1) {
        result = this.draftValues[0];
      }
    }

    return result;
  }

  getPossibleValues(): number[] {
    if (this.value !== undefined) {
      return [this.value];
    }

    return this.draftValues.slice();
  }

  getMinValue(): number | undefined {
    let result = this.value;

    if (result === undefined && this.draftValues.length > 0) {
      result = Math.min(...this.draftValues);
    }

    return result;
  }

  getMaxValue(): number | undefined {
    let result = this.value;

    if (result === undefined && this.draftValues.length > 0) {
      result = Math.max(...this.draftValues);
    }

    return result;
  }

  onBoxClicked() {
    this.cellClicked.emit(this);
  }
}
