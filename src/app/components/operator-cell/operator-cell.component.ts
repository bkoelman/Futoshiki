import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ComparisonOperator } from '../../models/comparison-operator.enum.js';
import * as ft from '../../../jquery.fittext.js';

declare var $: any;

@Component({
  selector: 'app-operator-cell',
  templateUrl: './operator-cell.component.html'
})
export class OperatorCellComponent implements OnInit, AfterViewInit {
  @ViewChild('autoSizeText') private _autoSizeTextRef!: ElementRef;

  ComparisonOperatorAlias = ComparisonOperator;
  @Input() boardSize!: number;
  @Input() value = ComparisonOperator.None;
  @Input() isRotated = false;

  ngOnInit() {
  }

  ngAfterViewInit() {
    const autoSizeTextTarget = $(this._autoSizeTextRef.nativeElement);
    if (this.isRotated) {
      autoSizeTextTarget.fitText(0.5);
    } else {
      autoSizeTextTarget.fitText(0.125);
    }
  }
}
