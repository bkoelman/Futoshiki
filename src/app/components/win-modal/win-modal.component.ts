import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-win-modal',
  templateUrl: './win-modal.component.html'
})
export class WinModalComponent implements OnInit {
  @Output() newGameClicked = new EventEmitter();
  @Output() restartClicked = new EventEmitter();
  @Output() changePuzzleClicked = new EventEmitter();

  ngOnInit() {
  }

  onNewGameClicked() {
    this.newGameClicked.emit();
  }

  onRestartClicked() {
    this.restartClicked.emit();
  }

  onChangePuzzleClicked() {
    this.changePuzzleClicked.emit();
  }
}
