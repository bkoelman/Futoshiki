import { $, browser, protractor } from 'protractor';
import { WaitTimeout } from '../timeout';

export class BoardSection {
  static readonly charCodeA = 'A'.charCodeAt(0);

  private _root = $('app-board');
  private _cells = this._root.$$('app-digit-cell');

  async selectCell(coordinate: string) {
    const index = await this.coordinateToIndex(coordinate);
    const cell = this.getCell(index);

    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(cell), WaitTimeout);
    await cell.click();
  }

  async isEmptyCell(coordinate: string): Promise<boolean> {
    const value = await this.getCellValue(coordinate);
    const candidates = await this.getCellCandidates(coordinate);
    return value === undefined && candidates.length === 0;
  }

  async getCellValue(coordinate: string): Promise<number | undefined> {
    const index = await this.coordinateToIndex(coordinate);
    const cell = this.getCell(index);

    const textElement = cell.$('.text-success, .text-dark');
    if (await textElement.isPresent()) {
      const text = await textElement.getText();
      return parseInt(text, 10);
    }

    return undefined;
  }

  async getCellCandidates(coordinate: string): Promise<number[]> {
    const index = await this.coordinateToIndex(coordinate);
    const cell = this.getCell(index);

    const digits: number[] = [];
    await cell.$$('.text-primary').each(async selector => {
      if (selector) {
        const text = await selector.getText();
        if (text) {
          const digit = parseInt(text, 10);
          digits.push(digit);
        }
      }
    });

    return digits;
  }

  private async coordinateToIndex(text: string): Promise<number> {
    const size = await this.getSize();

    if (text.length === 2) {
      const rowNumber = text.charCodeAt(0) - BoardSection.charCodeA;
      const columnNumber = parseInt(text[1], 10) - 1;

      const index = rowNumber * size + columnNumber;
      if (index >= 0 && index <= size * size) {
        return index;
      }
    }

    throw new Error(`Invalid coordinate '${text}' on ${size}x${size} board.`);
  }

  async getSize(): Promise<number> {
    const count = await this._cells.count();
    return Math.sqrt(count);
  }

  private getCell(index: number) {
    return this._root.$$('app-digit-cell > .box-container').get(index);
  }
}
