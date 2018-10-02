import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewChecked, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PuzzleInfo } from '../../models/puzzle-info';
import { PuzzleDifficulty } from '../../models/puzzle-difficulty.enum';
import { ObjectFacilities } from '../../object-facilities';

declare var $: any;

@Component({
  selector: 'app-change-puzzle',
  templateUrl: './change-puzzle.component.html'
})
export class ChangePuzzleComponent implements OnInit, AfterViewChecked {
  readonly maxPuzzleId = 9999;
  PuzzleDifficultyAlias = PuzzleDifficulty;
  info: PuzzleInfo | undefined;
  isModalVisible = false;
  @ViewChild('puzzleChangeForm') puzzleChangeForm: NgForm;
  @Input() isLoaderVisible: boolean;
  @Output() puzzleChanged = new EventEmitter<PuzzleInfo>();

  private _bootstrapHooksRegistered = false;
  private _lastChangeEventData: string | undefined;

  constructor(private _zone: NgZone) {
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.registerBootstrapHooks();
  }

  private registerBootstrapHooks() {
    if (!this._bootstrapHooksRegistered) {
      const target = $('#changePuzzleModal');
      if (target.length > 0) {
        target.on('show.bs.modal', () => {
          this._zone.run(() => {
            this.isModalVisible = true;
          });
        });
        target.on('hide.bs.modal', () => {
          this._zone.run(() => {
            this.isModalVisible = false;
          });
        });
        this._bootstrapHooksRegistered = true;
      }
    }
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
