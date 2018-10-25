import { BootstrapModal } from '../bootstrap-modal';
import { $, browser, protractor, by } from 'protractor';
import { ElementFacilities } from '../element-facilities';

export class ChangePuzzleModalSection extends BootstrapModal {
  protected readonly root = $('app-change-puzzle-modal');

  async selectDifficulty(value: string) {
    const difficultyRadioButton = this.root.$('#difficulty' + value);
    await ElementFacilities.clickOnElement(difficultyRadioButton);
  }

  async selectSize(size: number) {
    const sizeRadioButton = this.root.$('#size' + size.toString());
    await ElementFacilities.clickOnElement(sizeRadioButton);
  }

  async selectId(id: number) {
    const idTextBox = this.root.$('input[name=puzzleId]');
    await ElementFacilities.clickOnElement(idTextBox);

    await this.pressKeys(protractor.Key.BACK_SPACE);
    await this.pressKeys(id.toString());
  }

  private async pressKeys(keys: string) {
    return await browser
      .actions()
      .sendKeys(keys)
      .perform();
  }

  async clickNext() {
    const nextButton = this.root.element(by.cssContainingText('.btn', '>'));
    await ElementFacilities.clickOnElement(nextButton);
  }

  async clickOk() {
    const okButton = this.root.element(by.cssContainingText('.btn', 'Ok'));
    await ElementFacilities.clickOnElement(okButton);
  }
}
