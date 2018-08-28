import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-operator-cell',
  templateUrl: './operator-cell.component.html'
})
export class OperatorCellComponent implements OnInit {
  @Input() boardSize: number = 4;
  @Input() isGreaterThan: boolean | undefined;
  @Input() isRotated: boolean = false;

  ngOnInit() {
  }
}
