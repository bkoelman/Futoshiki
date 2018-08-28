import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-digitbar',
  host: {'(window:keydown)': 'onKeyDown($event)'},
  templateUrl: './digitbar.component.html'
})
export class DigitbarComponent implements OnInit {
  @Input() isEnabled: boolean;
  @Output() digitClicked = new EventEmitter<number | undefined>();

  ngOnInit() {
  }

  onButtonClicked(event: MouseEvent) {
    let button = <HTMLElement>event.target;
    let value = button.innerText == "X" ? undefined : parseInt(button.innerText);
    this.digitClicked.emit(value);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key == '1' || event.key == '2' || event.key == '3' || event.key == '4') {
      let value = parseInt(event.key);
      this.digitClicked.emit(value);
    }
    else if (event.code == 'Delete' || event.code == 'Backspace') {
      this.digitClicked.emit(undefined);
    }
  }
}
