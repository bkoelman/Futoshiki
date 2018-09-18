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
  @Input() difficulty: PuzzleDifficulty = PuzzleDifficulty.Easy;
  @Input() boardSize = 4;
  @Input() id = 1;
  @Input() isLoaderVisible: boolean;
  @Output() puzzleChanged = new EventEmitter<PuzzleInfo>();

  ngOnInit() {
  }

  setDefaults(info: PuzzleInfo) {
    this.difficulty = info.difficulty;
    this.boardSize = info.boardSize;
    this.id = info.id;
  }

  onPreviousButtonClicked(event: Event) {
    this.id--;
    this.puzzleChangeForm.onSubmit(event);
  }

  onNextButtonClicked(event: Event) {
    this.id++;
    this.puzzleChangeForm.onSubmit(event);
  }

  onApplyButtonClicked(event: Event): boolean {
    return this.puzzleChangeForm.onSubmit(event);
  }

  onFormSubmit(form: NgForm) {
    if (form.valid) {
      const info: PuzzleInfo = {
        difficulty: this.difficulty,
        boardSize: this.boardSize,
        id: this.id
      };
      this.puzzleChanged.emit(info);
    }
  }
}
