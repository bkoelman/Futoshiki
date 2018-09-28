import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ComparisonOperator } from '../../models/comparison-operator.enum.js';
import * as ft from '../../../jquery.fittext.js';

declare var $: any;

@Component({
  selector: 'app-operator-cell',
  templateUrl: './operator-cell.component.html'
})
export class OperatorCellComponent implements OnInit, AfterViewInit {
  ComparisonOperatorAlias = ComparisonOperator;
  @Input() boardSize = 4;
  @Input() operatorValue = ComparisonOperator.None;
  @Input() isRotated = false;
  @ViewChild('autoSizeText') autoSizeTextRef: ElementRef;

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const autoSizeTextTarget = $(this.autoSizeTextRef.nativeElement);
    if (this.isRotated) {
      autoSizeTextTarget.fitText(0.5);
    } else {
      autoSizeTextTarget.fitText(0.125);
    }
  }
}
