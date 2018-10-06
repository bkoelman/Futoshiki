import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GameSettings } from '../../models/game-settings';

@Component({
  selector: 'app-debug-console',
  templateUrl: './debug-console.component.html'
})
export class DebugConsoleComponent implements OnInit {
  private _saveText = '';

  @Input() isVisible!: boolean;
  @Input() isEnabled!: boolean;
  @Input() notifyOnWrongMoves!: boolean;
  @Input() autoCleanDraftValues!: boolean;
  @Output() loadClicked = new EventEmitter<string>();
  @Output() helpClicked = new EventEmitter();
  @Output() isTypingTextChanged = new EventEmitter<boolean>();
  @Output() settingsChanged = new EventEmitter<GameSettings>();

  ngOnInit() {
  }

  updateSaveGameText(saveText: string) {
    this._saveText = saveText;
  }

  onLoadClicked() {
    this.loadClicked.emit(this._saveText);
  }

  onHelpClicked() {
    this.helpClicked.emit();
  }

  textGotFocus() {
    this.isTypingTextChanged.emit(true);
  }

  textLostFocus() {
    this.isTypingTextChanged.emit(false);
  }

  updateSettings() {
    this.settingsChanged.emit({
      notifyOnWrongMoves: this.notifyOnWrongMoves,
      autoCleanDraftValues: this.autoCleanDraftValues
    });
  }
}
