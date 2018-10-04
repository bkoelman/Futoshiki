import { Component, OnInit, Input } from '@angular/core';
import { ComparisonOperator } from '../../models/comparison-operator.enum.js';

@Component({
  selector: 'app-operator-cell',
  templateUrl: './operator-cell.component.html'
})
export class OperatorCellComponent implements OnInit {
  ComparisonOperatorAlias = ComparisonOperator;
  @Input() boardSize!: number;
  @Input() value = ComparisonOperator.None;
  @Input() isRotated = false;

  ngOnInit() {
  }
}
