import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {
  @Input() fixedValue: number | undefined;
  @Input() isSelected: boolean;
  userValue: number | undefined;
  @Output() cellClicked = new EventEmitter<CellComponent>();

  get value(): number | undefined {
    return this.fixedValue !== undefined ? this.fixedValue : this.userValue;
  }

  ngOnInit() {
  }

  isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  isEmpty(): boolean {
    return this.value === undefined;
  }

  clear() {
    this.userValue = undefined;
  }

  onTableCellClicked() {
    this.cellClicked.emit(this);
  }
}
