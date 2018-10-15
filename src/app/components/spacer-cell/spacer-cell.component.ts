import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spacer-cell',
  templateUrl: './spacer-cell.component.html'
})
export class SpacerCellComponent implements OnInit {
  @Input() boardSize!: number;
  @Input() showRuler!: boolean;

  ngOnInit() {
  }
}
