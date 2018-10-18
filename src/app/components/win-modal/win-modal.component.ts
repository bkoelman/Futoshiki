import { Component, Output, EventEmitter } from '@angular/core';
import { ObjectFacilities } from 'src/app/object-facilities';

@Component({
  selector: 'app-win-modal',
  templateUrl: './win-modal.component.html'
})
export class WinModalComponent {
  finishTime = '';

  @Output()
  newGameClicked = new EventEmitter();
  @Output()
  restartClicked = new EventEmitter();
  @Output()
  changePuzzleClicked = new EventEmitter();

  setFinishTime(seconds: number) {
    const textComponents = [
      this.formatTimeComponent(seconds / (24 * 60 * 60), 'day'),
      this.formatTimeComponent((seconds / (60 * 60)) % 60, 'hour'),
      this.formatTimeComponent((seconds / 60) % 60, 'minute'),
      this.formatTimeComponent(seconds % 60, 'second')
    ];

    this.finishTime = ObjectFacilities.formatArray(textComponents.filter(text => text.length > 0));
  }

  private formatTimeComponent(value: number, name: string): string {
    if (value >= 1.0) {
      const isPlural = value >= 2;
      return Math.floor(value) + ' ' + name + (isPlural ? 's' : '');
    }
    return '';
  }

  onNewGameClicked() {
    this.newGameClicked.emit();
  }

  onRestartClicked() {
    this.restartClicked.emit();
  }

  onChangePuzzleClicked() {
    this.changePuzzleClicked.emit();
  }
}
