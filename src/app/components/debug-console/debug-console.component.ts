import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-debug-console',
  templateUrl: './debug-console.component.html'
})
export class DebugConsoleComponent implements OnInit {
  private _saveText = '';

  @Input() isVisible!: boolean;
  @Input() isEnabled!: boolean;
  @Output() loadClicked = new EventEmitter<string>();
  @Output() helpClicked = new EventEmitter();
  @Output() hintBoardClicked = new EventEmitter();
  @Output() hintCellClicked = new EventEmitter();
  @Output() isTypingTextChanged = new EventEmitter<boolean>();

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

  onHintBoardClicked() {
    this.hintBoardClicked.emit();
  }

  onHintCellClicked() {
    this.hintCellClicked.emit();
  }

  textGotFocus() {
    this.isTypingTextChanged.emit(true);
  }

  textLostFocus() {
    this.isTypingTextChanged.emit(false);
  }
}
