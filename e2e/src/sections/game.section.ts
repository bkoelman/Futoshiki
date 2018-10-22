import { MenuBarSection } from './menu-bar.section';
import { AboutModalSection } from './about-modal.section';
import { ButtonBarSection } from './button-bar.section';
import { BoardSection } from './board.section';

export class GameSection {
  menuBar = new MenuBarSection();
  aboutModal = new AboutModalSection();
  buttonBar = new ButtonBarSection();
  board = new BoardSection();

  async setCellValue(digit: number, coordinate: string) {
    await this.board.selectCell(coordinate);
    await this.buttonBar.clickDigit(digit);
  }

  async expectCellValue(coordinate: string, digit: number) {
    const value = await this.board.getCellValue(coordinate);
    expect(value).toBe(digit);
  }

  async setCellCandidates(digits: number[], coordinate: string) {
    await this.board.selectCell(coordinate);
    for (const digit of digits) {
      await this.buttonBar.clickCandidateDigit(digit);
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

  async expectEmptyCell(coordinate: string) {
    const isEmpty = await this.board.isEmptyCell(coordinate);
    expect(isEmpty).toBeTruthy();
  }
}
