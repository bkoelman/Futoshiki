import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { AfterViewChecked } from '@angular/core';
import { NgxToggle } from 'ngx-toggle';
import { NumberSequenceService } from '../number-sequence.service';
import * as ft from '../../jquery.fittext.js';

declare var $: any;

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent implements OnInit, AfterViewChecked {
  @Input() boardSize: number;
  @Input() isEnabled: boolean;
  @Output() digitClicked = new EventEmitter<{ value: number, isDraft: boolean }>();
  @Output() clearClicked = new EventEmitter();

  @ViewChildren('autoSizeText') autoSizeTextRefs: ElementRef[];
  @ViewChild('draftToggle') draftToggle: NgxToggle;

  get isInDraftMode(): boolean {
    return this.draftToggle.value === false;
  }

  constructor(public _numberSequenceService: NumberSequenceService) {
  }

  ngOnInit() {
  }

  ngAfterViewChecked(): void {
    // TODO: Verify we are not binding too often
    this.registerAutoSizeText();
  }

  registerAutoSizeText() {
    this.autoSizeTextRefs.forEach(textRef => {
      const autoSizeTextTarget = $(textRef.nativeElement);
      autoSizeTextTarget.fitText(0.15);
    });
  }

  onDigitButtonClicked(event: Event) {
    if (this.isEnabled) {
      const button = <HTMLElement>event.target;
      const digit = parseInt(button.innerText, 10);
      this.digitClicked.emit({
        value: digit,
        isDraft: this.isInDraftMode
      });
    }
  }

  onClearButtonClicked() {
    if (this.isEnabled) {
      this.clearClicked.emit();
    }
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.isEnabled) {
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
}
