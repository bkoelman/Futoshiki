import { Component, OnInit, Output, EventEmitter, AfterViewChecked, NgZone } from '@angular/core';
import { GameSettings } from '../../models/game-settings';

declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings-modal.component.html'
})
export class SettingsModalComponent implements OnInit, AfterViewChecked {
  private _bootstrapHooksRegistered = false;
  private _initialSettings: string | undefined;

  settings: GameSettings | undefined;
  isModalVisible = false;
  @Output() settingsChanged = new EventEmitter<GameSettings>();

  constructor(private _zone: NgZone) {
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.registerBootstrapHooks();
  }

  private registerBootstrapHooks() {
    if (!this._bootstrapHooksRegistered) {
      const target = $('#settingsModal');
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

  setDefaults(settings: GameSettings) {
    this.settings = {
      autoCleanCandidates: settings.autoCleanCandidates,
      notifyOnWrongMoves: settings.notifyOnWrongMoves,
      showHintExplanations: settings.showHintExplanations
    };
    this._initialSettings = JSON.stringify(settings);
  }

  onOkButtonClicked() {
    if (this.hasChangedSettings()) {
      this.onSettingsChanged();
    }
  }

  private hasChangedSettings(): boolean {
    const currentSettings = JSON.stringify(this.settings);
    return this._initialSettings !== currentSettings;
  }

  private onSettingsChanged() {
    if (this.settings) {
      this.settingsChanged.emit({
        autoCleanCandidates: this.settings.autoCleanCandidates,
        notifyOnWrongMoves: this.settings.notifyOnWrongMoves,
        showHintExplanations: this.settings.showHintExplanations
      });
    }
  }
}
