import { $, browser, protractor } from 'protractor';
import { WaitTimeout } from '../timeout';

export class BoardSection {
  static readonly charCodeA = 'A'.charCodeAt(0);

  private _root = $('app-board');
  private _cells = this._root.$$('app-digit-cell');

  async getSize(): Promise<number> {
    const count = await this._cells.count();
    return Math.sqrt(count);
  }

  async selectCell(coordinate: string) {
    const cell = await this.getCell(coordinate);

    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(cell), WaitTimeout);
    await cell.click();
  }

  async isEmptyCell(coordinate: string): Promise<boolean> {
    const value = await this.getCellValue(coordinate);
    const candidates = await this.getCellCandidates(coordinate);
    return value === undefined && candidates.length === 0;
  }

  async getCellValue(coordinate: string): Promise<number | undefined> {
    const cell = await this.getCell(coordinate);

    const textElement = cell.$('.text-success, .text-dark');
    if (await textElement.isPresent()) {
      const text = await textElement.getText();
      return parseInt(text, 10);
    }

    return undefined;
  }

  async getCellCandidates(coordinate: string): Promise<number[]> {
    const cell = await this.getCell(coordinate);

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

  async hasErrorInCell(coordinate: string): Promise<boolean> {
    const cell = await this.getCell(coordinate);

    const errorElement = cell.$('.flash');
    if (await errorElement.isPresent()) {
      return true;
    }

    return false;
  }

  async hasErrorInOperator(coordinate: string, direction: 'left' | 'right' | 'up' | 'down'): Promise<boolean> {
    const operator = await this.getOperator(coordinate, direction);

    const errorElement = operator.$('.flash');
    if (await errorElement.isPresent()) {
      return true;
    }

    return false;
  }

  async waitForErrorCompleted() {
    const selector = this._root.$('.flash');
    await browser.wait(protractor.ExpectedConditions.stalenessOf(selector), WaitTimeout);
  }

  private async getCell(coordinate: string) {
    const index = await this.coordinateToIndex(coordinate);
    return this._root.$$('app-digit-cell > .box-container').get(index);
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

  private async getOperator(coordinate: string, direction: 'left' | 'right' | 'up' | 'down') {
    const index = await this.getIndexForOperator(coordinate, direction);
    return this._root.$$('app-operator-cell > .box-container').get(index);
  }

  private async getIndexForOperator(coordinate: string, direction: 'left' | 'right' | 'up' | 'down'): Promise<number> {
    const size = await this.getSize();

    const cellIndex = await this.coordinateToIndex(coordinate);
    const cellRowIndex = Math.floor(cellIndex / size);
    const cellColumnIndex = cellIndex % size;
    const operatorRowSize = 2 * size - 1;

    switch (direction) {
      case 'left':
        return cellRowIndex * operatorRowSize + cellColumnIndex - 1;
      case 'right':
        return cellRowIndex * operatorRowSize + cellColumnIndex;
      case 'up':
        return (cellRowIndex - 1) * operatorRowSize + size - 1 + cellColumnIndex;
      case 'down':
        return cellRowIndex * operatorRowSize + size - 1 + cellColumnIndex;
    }

    this.assertUnreachable(direction);
  }

  private assertUnreachable(value: never): never {
    throw new Error('Unreachable code detected');
  }
}
