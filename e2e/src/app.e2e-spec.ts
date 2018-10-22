import { AppPage } from './app.po';
import { GameSection } from './sections/game.section';
import { browser } from 'protractor';

describe('Futoshiki', () => {
  let game: GameSection;

  beforeEach(async () => {
    await browser.manage().deleteAllCookies();

    const page = new AppPage();
    await page.navigateTo();
    game = page.game;
  });

  describe('Basic gameplay', () => {
    it('should enable digit entry on the board', async () => {
      await game.setCellValue(1, 'B2');
      await game.expectCellValue('B2', 1);

      await game.setCellCandidates([1, 3, 2, 1], 'C1');
      await game.expectCellCandidates('C1', [2, 3]);

      await game.clearCell('C1');
      await game.expectEmptyCell('C1');

      await game.buttonBar.clickUndo();
      await game.expectCellCandidates('C1', [2, 3]);
    });

    it('should promote single-digit candidates on the board', async () => {
      await game.setCellCandidates([4], 'A1');
      await game.setCellCandidates([3], 'B2');
      await game.setCellCandidates([2], 'C3');
      await game.setCellCandidates([1], 'D4');

      await game.buttonBar.clickPromote();

      expect(game.board.getCellValue('A1')).toBe(4);
      expect(game.board.getCellValue('B2')).toBe(3);
      expect(game.board.getCellValue('C3')).toBe(2);
      expect(game.board.getCellValue('D4')).toBe(1);
    });
  });

  describe('Puzzle management', () => {
    it('should open and close menu', async () => {
      expect(game.menuBar.getBrandText()).toEqual('Futoshiki');
      await game.menuBar.toggle();
      await game.menuBar.toggle();
    });

    it('should display about dialog', async () => {
      await game.menuBar.toggle();
      await game.menuBar.selectAbout();

      await game.aboutModal.waitForVisible();
      await game.aboutModal.close();
      await game.aboutModal.waitForHidden();
    });
  });
});
