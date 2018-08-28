import { Component, OnInit, Input, AfterViewInit, ElementRef } from '@angular/core';
import * as ft from '../../jquery.fittext.js'

declare var $: any;

@Component({
  selector: 'app-operator-cell',
  templateUrl: './operator-cell.component.html'
})
export class OperatorCellComponent implements OnInit, AfterViewInit {
  @Input() boardSize: number = 4;
  @Input() isGreaterThan: boolean | undefined;
  @Input() isRotated: boolean = false;

  constructor(private _elementRef: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    let resizeTarget = $(this._elementRef.nativeElement).find('.container-content-table-cell');
    if (this.isRotated) {
      resizeTarget.fitText(0.5);
    }
    else {
      resizeTarget.fitText(0.125);
    }
  }
}
