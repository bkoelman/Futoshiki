import { browser, protractor } from 'protractor';
import { MenuBarSection } from './menu-bar.section';
import { BoardSection } from './board.section';
import { ButtonBarSection } from './button-bar.section';
import { AboutModalSection } from './about-modal.section';
import { ChangePuzzleModalSection } from './change-puzzle-modal.section';
import { WinModalSection } from './win-modal.section';

export class GameSection {
  menuBar = new MenuBarSection();
  board = new BoardSection();
  buttonBar = new ButtonBarSection();
  aboutModal = new AboutModalSection();
  changePuzzleModal = new ChangePuzzleModalSection();
  winModal = new WinModalSection();

  async setCellValue(coordinate: string, digit: number) {
    await this.board.selectCell(coordinate);
    await this.buttonBar.clickDigit(digit);
  }

  async typeCellValue(coordinate: string, digit: number) {
    await this.board.selectCell(coordinate);
    await this.pressKeys(digit.toString());
  }

  async expectCellValue(coordinate: string, digit: number | undefined) {
    const value = await this.board.getCellValue(coordinate);
    expect(value).toBe(digit);
  }

  async setCellCandidates(coordinate: string, digits: number[]) {
    await this.board.selectCell(coordinate);
    for (const digit of digits) {
      await this.buttonBar.clickCandidateDigit(digit);
    }
  }

  async typeCellCandidates(coordinate: string, digits: number[]) {
    await this.board.selectCell(coordinate);
    for (const digit of digits) {
      await this.pressKeys(protractor.Key.chord(protractor.Key.ALT, digit.toString()));
    }
  }

  async expectCellCandidates(coordinate: string, digits: number[]) {
    digits.sort();
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      if (digits.filter(d => d === value).length % 2 === 0) {
        digits = digits.filter(d => d !== value);
      }
    }

    const candidates = await this.board.getCellCandidates(coordinate);
    expect(candidates.join()).toBe(digits.join());
  }

  async clearCell(coordinate: string) {
    await this.board.selectCell(coordinate);
    await this.buttonBar.clickClear();
  }

  async typeClearCell(coordinate: string) {
    await this.board.selectCell(coordinate);
    await this.pressKeys(protractor.Key.DELETE);
  }

  async expectEmptyCell(coordinate: string) {
    const isEmpty = await this.board.isEmptyCell(coordinate);
    expect(isEmpty).toBeTruthy();
  }

  async undo() {
    await this.buttonBar.clickUndo();
  }

  async typeUndo() {
    await this.pressKeys(protractor.Key.chord(protractor.Key.CONTROL, 'z'));
  }

  private async pressKeys(keys: string) {
    return await browser
      .actions()
      .sendKeys(keys)
      .perform();
  }
}
