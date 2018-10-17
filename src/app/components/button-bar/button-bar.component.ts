import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent implements OnInit, AfterViewChecked {
  @ViewChild('rectangleButtonGroup')
  private _rectangleButtonGroupElementRef!: ElementRef;

  private _firstTimeResizeCompleted = false;

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

  ngOnInit() {
    $(window).resize(() => this.resizeRectangleButtonGroup());
  }

  ngAfterViewChecked() {
    if (!this._firstTimeResizeCompleted && this.boardSize) {
      this.resizeRectangleButtonGroup();
      this._firstTimeResizeCompleted = true;
    }
  }

  private resizeRectangleButtonGroup() {
    if (this.boardSize) {
      const containerWidth = $(this._rectangleButtonGroupElementRef.nativeElement).width();
      if (containerWidth) {
        const fontSizeInRem = Math.max(0.5, containerWidth * 0.0053 - 0.1265);
        const paddingLeftRightInRem = fontSizeInRem / 2;

        const buttons = $(this._rectangleButtonGroupElementRef.nativeElement).find('.btn');
        buttons.css('font-size', fontSizeInRem + 'rem');
        buttons.css('padding', `0.375rem ${paddingLeftRightInRem}rem`);
      }
    }
  }

  onDigitButtonClicked(event: Event, isCandidate: boolean) {
    if (this.isEnabled) {
      const button = <HTMLElement>event.target;
      const digit = parseInt(button.innerText, 10);
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
