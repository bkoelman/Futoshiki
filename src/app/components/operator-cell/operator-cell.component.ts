import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ComparisonOperator } from '../../models/comparison-operator.enum.js';

declare var $: any;

@Component({
  selector: 'app-operator-cell',
  templateUrl: './operator-cell.component.html'
})
export class OperatorCellComponent {
  @ViewChild('flashable')
  private _flashableElementRef!: ElementRef;

  ComparisonOperatorAlias = ComparisonOperator;

  @Input()
  boardSize!: number;
  @Input()
  value = ComparisonOperator.None;
  @Input()
  isRotated = false;
  @Input()
  showRuler!: boolean;

  flash(callback: () => void) {
    $(this._flashableElementRef.nativeElement).animateCss('flash', callback);
  }
}
