import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';
import { ObjectFacilities } from '../object-facilities';

@Component({
  selector: 'app-change-puzzle',
  templateUrl: './change-puzzle.component.html'
})
export class ChangePuzzleComponent implements OnInit {
  readonly maxPuzzleId = 9999;
  PuzzleDifficultyAlias = PuzzleDifficulty;
  info: PuzzleInfo | undefined;
  @ViewChild('puzzleChangeForm') puzzleChangeForm: NgForm;
  @Input() isLoaderVisible: boolean;
  @Output() puzzleChanged = new EventEmitter<PuzzleInfo>();

  private _lastChangeEventData: string;

  ngOnInit() {
  }

  setDefaults(info: PuzzleInfo) {
    this.info = {
      difficulty: info.difficulty,
      boardSize: info.boardSize,
      id: info.id
    };
    this._lastChangeEventData = undefined;
  }

  onPreviousButtonClicked(event: Event) {
    this.info.id--;
    this.onPuzzleChanged();
  }

  onNextButtonClicked(event: Event) {
    this.info.id++;
    this.onPuzzleChanged();
  }

  onRandomButtonClicked() {
    this.info.id = ObjectFacilities.getRandomIntegerInRange(1, this.maxPuzzleId);
    this.onPuzzleChanged();
  }

  onApplyButtonClicked(event: Event) {
    this.onPuzzleChanged();
  }

  onPuzzleChanged() {
    const infoData = JSON.stringify(this.info);

    if (this._lastChangeEventData !== infoData) {
      this._lastChangeEventData = infoData;
      this.puzzleChanged.emit({
        difficulty: this.info.difficulty,
        boardSize: this.info.boardSize,
        id: this.info.id
      });
    }
  }
}
