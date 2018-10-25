import { BootstrapModal } from '../bootstrap-modal';
import { $, browser, protractor, by } from 'protractor';

export class ChangePuzzleModalSection extends BootstrapModal {
  protected readonly root = $('app-change-puzzle-modal');

  async selectDifficulty(value: string) {
    await this.root.$('#difficulty' + value).click();
  }

  async selectSize(size: number) {
    await this.root.$('#size' + size.toString()).click();
  }

  async selectId(id: number) {
    await this.root.$('input[name=puzzleId]').click();

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
    await nextButton.click();
  }

  async clickOk() {
    const okButton = this.root.element(by.cssContainingText('.btn', 'Ok'));
    await okButton.click();
  }
}
