import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import * as ft from '../../jquery.fittext.js'

declare var $: any;

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements OnInit, AfterViewInit {
  @Input() boardSize: number = 4;
  @Input() fixedValue: number | undefined;
  @Input() isSelected: boolean;
  userValue: number | undefined;
  @Output() cellClicked = new EventEmitter<DigitCellComponent>();

  get value(): number | undefined {
    return this.fixedValue !== undefined ? this.fixedValue : this.userValue;
  }

  get isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  get isEmpty(): boolean {
    return this.value === undefined;
  }

  constructor(private _elementRef: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    let resizeTarget = $(this._elementRef.nativeElement).find('.container-content-table-cell');
    resizeTarget.fitText(0.15);
  }

  clear() {
    this.userValue = undefined;
  }

  onTableCellClicked() {
    this.cellClicked.emit(this);
  }
}
