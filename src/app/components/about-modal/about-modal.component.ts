import { Component, AfterViewChecked, NgZone } from '@angular/core';
import { buildVersion } from '../../build-version';

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html'
})
export class AboutModalComponent implements AfterViewChecked {
  private _bootstrapHooksRegistered = false;

  version = buildVersion;
  isModalVisible = false;

  constructor(private _zone: NgZone) {}

  ngAfterViewChecked() {
    this.registerBootstrapHooks();
  }

  private registerBootstrapHooks() {
    if (!this._bootstrapHooksRegistered) {
      const target = $('#aboutModal');
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
}
