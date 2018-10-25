import { $, by } from 'protractor';
import { ElementFacilities } from '../element-facilities';

export class ButtonBarSection {
  private _root = $('app-button-bar');

  async clickDigit(digit: number) {
    const digitButton = this._root.element(by.cssContainingText('.green', digit.toString()));
    await ElementFacilities.clickOnElement(digitButton);
  }

  async clickCandidateDigit(digit: number) {
    const candidateButton = this._root.element(by.cssContainingText('.blue', digit.toString()));
    await ElementFacilities.clickOnElement(candidateButton);
  }

  async clickClear() {
    const clearButton = this._root.element(by.cssContainingText('.gray', '×'));
    await ElementFacilities.clickOnElement(clearButton);
  }

  async clickHintCell() {
    const hintButton = this._root.element(by.cssContainingText('.blue', '?'));
    await ElementFacilities.clickOnElement(hintButton);
  }

  async clickUndo() {
    const undoButton = this._root.element(by.buttonText('Undo'));
    await ElementFacilities.clickOnElement(undoButton);
  }

  async clickPromote() {
    const promoteButton = this._root.element(by.buttonText('Promote'));
    await ElementFacilities.clickOnElement(promoteButton);
  }

  async clickHintBoard() {
    const hintButton = this._root.element(by.buttonText('Hint'));
    await ElementFacilities.clickOnElement(hintButton);
  }
}
