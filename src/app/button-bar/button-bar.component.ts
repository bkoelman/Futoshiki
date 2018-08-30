import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent implements OnInit {
  @Input() boardSize: number;
  @Input() isEnabled: boolean;
  @Output() digitClicked = new EventEmitter<number | undefined>();

  ngOnInit() {
  }

  createNumberSequence(count: number): number[] {
    return Array.apply(undefined, Array(count)).map((x, y) => y + 1);
  }

  onButtonClicked(event: MouseEvent) {
    const button = <HTMLElement>event.target;
    const value = button.innerText === 'X' ? undefined : parseInt(button.innerText, 10);
    this.digitClicked.emit(value);
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Delete' || event.code === 'Backspace') {
      this.digitClicked.emit(undefined);
    } else {
      const digit = parseInt(event.key, 10);
      if (!isNaN(digit) && digit > 0 && digit <= this.boardSize) {
        this.digitClicked.emit(digit);
      }
    }
  }
}
