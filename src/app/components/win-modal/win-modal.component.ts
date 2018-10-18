import { Component, Output, EventEmitter } from '@angular/core';

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
    let text = this.addTextComponent('', seconds / (24 * 60 * 60), 'day');
    text = this.addTextComponent(text, (seconds / (60 * 60)) % 60, 'hour');
    text = this.addTextComponent(text, (seconds / 60) % 60, 'minute');
    text = this.addTextComponent(text, seconds % 60, 'second', true);

    this.finishTime = text;
  }

  private addTextComponent(target: string, value: number, name: string, isLast = false): string {
    let result = target;

    if (target.length > 0) {
      if (isLast) {
        result += ' and ';
      } else {
        result += ', ';
      }
    }

    if (value >= 1.0) {
      const isPlural = value >= 2;
      result += Math.floor(value) + ' ' + name + (isPlural ? 's' : '');
    }

    return result;
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
