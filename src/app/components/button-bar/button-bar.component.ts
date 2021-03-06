import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent {
  @Input()
  boardSize: number | undefined;
  @Input()
  isEnabled!: boolean;
  @Input()
  canUndo!: boolean;
  @Input()
  areKeysEnabled!: boolean;
  @Output()
  digitClicked = new EventEmitter<{ digit: number; isCandidate: boolean }>();
  @Output()
  clearClicked = new EventEmitter();
  @Output()
  hintCellClicked = new EventEmitter();
  @Output()
  undoClicked = new EventEmitter();
  @Output()
  promoteClicked = new EventEmitter();
  @Output()
  hintBoardClicked = new EventEmitter();

  onDigitButtonClicked(digit: number, isCandidate: boolean) {
    if (this.isEnabled) {
      this.digitClicked.emit({
        digit: digit,
        isCandidate: isCandidate
      });
    }
  }

  onClearClicked() {
    if (this.isEnabled) {
      this.clearClicked.emit();
    }
  }

  onHintCellClicked() {
    if (this.isEnabled) {
      this.hintCellClicked.emit();
    }
  }

  onUndoClicked() {
    if (this.isEnabled && this.canUndo) {
      this.undoClicked.emit();
    }
  }

  onPromoteClicked() {
    if (this.isEnabled) {
      this.promoteClicked.emit();
    }
  }

  onHintBoardClicked() {
    if (this.isEnabled) {
      this.hintBoardClicked.emit();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.isEnabled && this.areKeysEnabled && this.boardSize) {
      if (event.key === 'Delete' || event.key === 'Del' || event.key === 'Backspace') {
        event.preventDefault();
        this.clearClicked.emit();
      } else if (event.key === '?') {
        this.hintCellClicked.emit();
      } else if (event.ctrlKey && event.key === 'z') {
        if (this.canUndo) {
          this.undoClicked.emit();
        }
      } else {
        const digit = parseInt(event.key, 10);
        if (!isNaN(digit) && digit > 0 && digit <= this.boardSize) {
          this.digitClicked.emit({
            digit: digit,
            isCandidate: event.ctrlKey || event.altKey
          });
        }
      }
    }
  }
}
