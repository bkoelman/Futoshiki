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
  @Input() puzzleInfo: PuzzleInfo = {
    difficulty: PuzzleDifficulty.Easy,
    boardSize: 4,
    id: 1
  };
  @Input() isLoaderVisible: boolean;
  @Output() puzzleChanged = new EventEmitter<PuzzleInfo>();

  ngOnInit() {
  }

  onPreviousButtonClicked(event: Event) {
    this.puzzleInfo.id--;
    this.puzzleChangeForm.onSubmit(event);
  }

  onNextButtonClicked(event: Event) {
    this.puzzleInfo.id++;
    this.puzzleChangeForm.onSubmit(event);
  }

  onApplyButtonClicked(event: Event): boolean {
    return this.puzzleChangeForm.onSubmit(event);
  }

  onFormSubmit(form: NgForm) {
    if (form.valid) {
      this.puzzleChanged.emit(this.puzzleInfo);
    }
  }
}
