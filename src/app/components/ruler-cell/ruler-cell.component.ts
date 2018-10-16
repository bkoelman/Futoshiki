import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ruler-cell',
  templateUrl: './ruler-cell.component.html'
})
export class RulerCellComponent {
  @Input() boardSize!: number;
  @Input() label!: string;
  @Input() isVertical!: boolean;
}
