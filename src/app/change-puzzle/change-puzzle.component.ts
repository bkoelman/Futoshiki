import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';

@Component({
  selector: 'app-change-puzzle',
  templateUrl: './change-puzzle.component.html'
})
export class ChangePuzzleComponent implements OnInit {
  readonly maxPuzzleId = 9999;
  PuzzleDifficultyAlias = PuzzleDifficulty;

  @ViewChild('puzzleChangeForm') puzzleChangeForm: NgForm;
  @Input() isLoaderVisible: boolean;
  @Output() puzzleChanged = new EventEmitter<PuzzleInfo>();

  private _info: PuzzleInfo | undefined;
  private _lastChangeEventData: string;

  ngOnInit() {
  }

  setDefaults(info: PuzzleInfo) {
    this._info = {
      difficulty: info.difficulty,
      boardSize: info.boardSize,
      id: info.id
    };
    this._lastChangeEventData = undefined;
  }

  onPreviousButtonClicked(event: Event) {
    this._info.id--;
    this.onPuzzleChanged();
  }

  onNextButtonClicked(event: Event) {
    this._info.id++;
    this.onPuzzleChanged();
  }

  onApplyButtonClicked(event: Event) {
    this.onPuzzleChanged();
  }

  onPuzzleChanged() {
    const infoData = JSON.stringify(this._info);

    if (this._lastChangeEventData !== infoData) {
      this._lastChangeEventData = infoData;
      this.puzzleChanged.emit(this._info);
    }
  }
}
