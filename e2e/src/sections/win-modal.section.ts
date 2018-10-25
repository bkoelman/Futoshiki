import { $, by } from 'protractor';
import { BootstrapModal } from '../bootstrap-modal';
import { ElementFacilities } from '../element-facilities';

export class WinModalSection extends BootstrapModal {
  protected readonly root = $('app-win-modal');

  async clickNewGame() {
    const newGameButton = this.root.element(by.cssContainingText('.btn', 'New game'));
    await ElementFacilities.clickOnElement(newGameButton);
  }
}
