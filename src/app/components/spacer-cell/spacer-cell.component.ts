import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spacer-cell',
  templateUrl: './spacer-cell.component.html'
})
export class SpacerCellComponent {
  @Input() boardSize!: number;
  @Input() showRuler!: boolean;
}
