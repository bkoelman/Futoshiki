import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { AfterViewChecked } from '@angular/core';
import * as ft from '../../../jquery.fittext.js';

declare var $: any;

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html'
})
export class ButtonBarComponent implements OnInit, AfterViewChecked {
  @Input() boardSize: number | undefined;
  @Input() isEnabled: boolean;
  @Input() areKeysEnabled = true;
  @Output() digitClicked = new EventEmitter<{ value: number, isDraft: boolean }>();
  @Output() clearClicked = new EventEmitter();
  @Output() hintClicked = new EventEmitter();

  @ViewChildren('autoSizeText') autoSizeTextRefs: ElementRef[];

  ngOnInit() {
  }

  ngAfterViewChecked() {
    // TODO: Verify we are not binding too often
    this.registerAutoSizeText();
  }

  registerAutoSizeText() {
    this.autoSizeTextRefs.forEach(textRef => {
      const autoSizeTextTarget = $(textRef.nativeElement);
      autoSizeTextTarget.fitText(0.15);
    });
  }

  onDigitButtonClicked(event: Event, isDraft: boolean) {
    if (this.isEnabled) {
      const button = <HTMLElement>event.target;
      const digit = parseInt(button.innerText, 10);
      this.digitClicked.emit({
        value: digit,
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
    if (this.isEnabled && this.areKeysEnabled) {
      if (event.code === 'Delete' || event.key === 'Del' || event.code === 'Backspace' || event.key === 'Backspace') {
        event.preventDefault();
        this.clearClicked.emit();
      } else if (event.key === '?') {
        this.hintClicked.emit();
      } else {
        const digit = parseInt(event.key, 10);
        if (!isNaN(digit) && digit > 0 && digit <= this.boardSize) {
          this.digitClicked.emit({
            value: digit,
            isDraft: event.ctrlKey || event.altKey
          });
        }
      }
    }
  }
}
