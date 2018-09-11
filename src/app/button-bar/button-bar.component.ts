import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { NgxToggle } from 'ngx-toggle';
import { NumberSequenceService } from '../number-sequence.service';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent implements OnInit {
  @Input() boardSize: number;
  @Input() isEnabled: boolean;
  @Output() digitClicked = new EventEmitter<{ value: number, isDraft: boolean }>();
  @Output() clearClicked = new EventEmitter();

  @ViewChild('draftToggle') draftToggle: NgxToggle;

  constructor(private _numberSequenceService: NumberSequenceService) {
  }

  ngOnInit() {
  }

  private get isInDraftMode(): boolean {
    return this.draftToggle.value === false;
  }

  onDigitButtonClicked(event: Event) {
    const button = <HTMLElement>event.target;
    const digit = parseInt(button.innerText, 10);
    this.digitClicked.emit({
      value: digit,
      isDraft: this.isInDraftMode
    });
  }

  onClearButtonClicked() {
    this.clearClicked.emit();
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Delete' || event.code === 'Backspace') {
      this.clearClicked.emit();
    } else {
      const digit = parseInt(event.key, 10);
      if (!isNaN(digit) && digit > 0 && digit <= this.boardSize) {
        this.digitClicked.emit({
          value: digit,
          isDraft: this.isInDraftMode || event.ctrlKey || event.altKey
        });
      }
    }
  }
}
