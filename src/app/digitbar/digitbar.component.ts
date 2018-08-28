import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-digitbar',
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
}
