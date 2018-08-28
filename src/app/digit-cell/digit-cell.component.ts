import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements OnInit {
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

  ngOnInit() {
  }

  clear() {
    this.userValue = undefined;
  }

  onTableCellClicked() {
    this.cellClicked.emit(this);
  }
}
