import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';

@Component({
  selector: 'app-change-puzzle',
  templateUrl: './change-puzzle.component.html'
})
export class ChangePuzzleComponent implements OnInit {
  @Input() puzzleInfo: PuzzleInfo = {
    difficulty: PuzzleDifficulty.Easy,
    boardSize: 4,
    id: 1
  };
  @Output() puzzleChanged = new EventEmitter<PuzzleInfo>();

  PuzzleDifficultyAlias = PuzzleDifficulty;

  ngOnInit() {
  }

  incrementPuzzleId() {
    if (this.puzzleInfo.id < 9999) {
      this.puzzleInfo.id++;
    }
    this.correctRangeForPuzzleId();
  }

  decrementPuzzleId() {
    if (this.puzzleInfo.id > 1) {
      this.puzzleInfo.id--;
    }
    this.correctRangeForPuzzleId();
  }

  private correctRangeForPuzzleId() {
    if (this.puzzleInfo.id % 1 !== 0) {
      this.puzzleInfo.id = Math.round(this.puzzleInfo.id);
    }
    if (this.puzzleInfo.id < 1) {
      this.puzzleInfo.id = 1;
    } else if (this.puzzleInfo.id > 9999) {
      this.puzzleInfo.id = 9999;
    }
  }

  applyChanges(form: NgForm) {
    if (form.valid) {
      this.puzzleChanged.emit(this.puzzleInfo);
    }
  }
}