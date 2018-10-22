import { $, browser, by, protractor, ElementFinder } from 'protractor';
import { WaitTimeout } from '../timeout';

export class ButtonBarSection {
  private _root = $('app-button-bar');

  async clickDigit(digit: number) {
    const digitButton = this._root.element(by.cssContainingText('.green', digit.toString()));
    await this.clickOnButton(digitButton);
  }

  async clickCandidateDigit(digit: number) {
    const candidateButton = this._root.element(by.cssContainingText('.blue', digit.toString()));
    await this.clickOnButton(candidateButton);
  }

  async clickClear() {
    const clearButton = this._root.element(by.cssContainingText('.gray', '×'));
    await this.clickOnButton(clearButton);
  }

  async clickUndo() {
    const undoButton = this._root.element(by.buttonText('Undo'));
    await this.clickOnButton(undoButton);
  }

  async clickPromote() {
    const promoteButton = this._root.element(by.buttonText('Promote'));
    await this.clickOnButton(promoteButton);
  }

  private async clickOnButton(button: ElementFinder) {
    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(button), WaitTimeout);
    await button.click();
  }
}
