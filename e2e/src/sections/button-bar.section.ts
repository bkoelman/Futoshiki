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

  async clickHintCell() {
    const hintButton = this._root.element(by.cssContainingText('.blue', '?'));
    await this.clickOnButton(hintButton);
  }

  async clickUndo() {
    const undoButton = this._root.element(by.buttonText('Undo'));
    await this.clickOnButton(undoButton);
  }

  async clickPromote() {
    const promoteButton = this._root.element(by.buttonText('Promote'));
    await this.clickOnButton(promoteButton);
  }

  async clickHintBoard() {
    const hintButton = this._root.element(by.buttonText('Hint'));
    await this.clickOnButton(hintButton);
  }

  private async clickOnButton(button: ElementFinder) {
    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(button), WaitTimeout);
    await button.click();
  }
}
