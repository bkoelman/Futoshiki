import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent implements OnInit {
  @Input() boardSize: number | undefined;
  @Input() isEnabled!: boolean;
  @Input() areKeysEnabled!: boolean;
  @Output() digitClicked = new EventEmitter<{ digit: number, isDraft: boolean }>();
  @Output() clearClicked = new EventEmitter();
  @Output() hintClicked = new EventEmitter();

  ngOnInit() {
  }

  onDigitButtonClicked(event: Event, isDraft: boolean) {
    if (this.isEnabled) {
      const button = <HTMLElement>event.target;
      const digit = parseInt(button.innerText, 10);
      this.digitClicked.emit({
        digit: digit,
        isDraft: isDraft
      });
    }
  }

  onClearButtonClicked() {
    if (this.isEnabled) {
      this.clearClicked.emit();
    }
  }

  onHintButtonClicked() {
    if (this.isEnabled) {
      this.hintClicked.emit();
    }
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.isEnabled && this.areKeysEnabled && this.boardSize) {
      if (event.code === 'Delete' || event.key === 'Del' || event.code === 'Backspace' || event.key === 'Backspace') {
        event.preventDefault();
        this.clearClicked.emit();
      } else if (event.key === '?') {
        this.hintClicked.emit();
      } else {
        const digit = parseInt(event.key, 10);
        if (!isNaN(digit) && digit > 0 && digit <= this.boardSize) {
          this.digitClicked.emit({
            digit: digit,
            isDraft: event.ctrlKey || event.altKey
          });
        }
      }
    }
  }
}
