import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as ft from '../../jquery.fittext.js';

declare var $: any;

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements OnInit, AfterViewInit {
  @Input() boardSize = 4;
  @Input() fixedValue: number | undefined;
  @Input() isSelected: boolean;
  userValue: number | undefined;
  @Output() cellClicked = new EventEmitter<DigitCellComponent>();
  @ViewChild('autoSizeText') autoSizeTextRef: ElementRef;

  get value(): number | undefined {
    return this.fixedValue !== undefined ? this.fixedValue : this.userValue;
  }

  get isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  get isEmpty(): boolean {
    return this.value === undefined;
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const autoSizeTextTarget = $(this.autoSizeTextRef.nativeElement);
    autoSizeTextTarget.fitText(0.15);
  }

  clear() {
    this.userValue = undefined;
  }

  onTableCellClicked() {
    this.cellClicked.emit(this);
  }
}
