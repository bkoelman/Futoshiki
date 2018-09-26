import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-debug-console',
  templateUrl: './debug-console.component.html'
})
export class DebugConsoleComponent implements OnInit {
  @Input() isEnabled: boolean;
  @Output() loadClicked = new EventEmitter<string>();
  @Output() helpClicked = new EventEmitter();
  @Output() promoteClicked = new EventEmitter();
  @Output() isTypingTextChanged = new EventEmitter<boolean>();

  private _gameStateText: string;

  ngOnInit() {
  }

  updateSaveGameText(gameStateText: string): void {
    this._gameStateText = gameStateText;
  }

  onLoadClicked() {
    this.loadClicked.emit(this._gameStateText);
  }

  onHelpClicked() {
    this.helpClicked.emit();
  }

  onPromoteClicked() {
    this.promoteClicked.emit();
  }

  textGotFocus() {
    this.isTypingTextChanged.emit(true);
  }

  textLostFocus() {
    this.isTypingTextChanged.emit(false);
  }
}
