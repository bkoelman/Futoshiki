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
    it('should enter digits on the board via mouse', async () => {
      await game.setCellValue('B2', 1);
      await game.expectCellValue('B2', 1);

      await game.setCellCandidates('C1', [1, 3, 2, 1]);
      await game.expectCellCandidates('C1', [2, 3]);

      await game.clearCell('C1');
      await game.expectEmptyCell('C1');

      await game.undo();
      await game.expectCellCandidates('C1', [2, 3]);
    });

    it('should enter digits on the board via keyboard', async () => {
      await game.typeCellValue('B2', 1);
      await game.expectCellValue('B2', 1);

      await game.typeCellCandidates('C1', [1, 3, 2, 1]);
      await game.expectCellCandidates('C1', [2, 3]);

      await game.typeClearCell('C1');
      await game.expectEmptyCell('C1');

      await game.typeUndo();
      await game.expectCellCandidates('C1', [2, 3]);
    });

    it('should promote single-digit candidates on the board', async () => {
      await game.setCellCandidates('A1', [4]);
      await game.setCellCandidates('B2', [3]);
      await game.setCellCandidates('C3', [2]);
      await game.setCellCandidates('D4', [1]);

      await game.buttonBar.clickPromote();

      expect(game.board.getCellValue('A1')).toBe(4);
      expect(game.board.getCellValue('B2')).toBe(3);
      expect(game.board.getCellValue('C3')).toBe(2);
      expect(game.board.getCellValue('D4')).toBe(1);
    });

    it('should use hints to solve the board', async () => {
      for (let index = 0; index < 25; index++) {
        await game.buttonBar.clickHintBoard();
      }

      await game.winModal.waitForVisible();
      await game.winModal.clickNewGame();
    });

    it('should provide hints for cells', async () => {
      await game.buttonBar.clickHintBoard();

      await game.provideHintForCell('D4');
      await game.expectCellCandidates('D4', [2, 3]);

      await game.typeHintForCell('D3');
      await game.expectCellCandidates('D3', [1, 2]);
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

    it('should restart puzzle', async () => {
      await game.setCellValue('D4', 3);
      await game.expectCellValue('D4', 3);

      await game.menuBar.toggle();
      await game.menuBar.selectRestart();

      await game.expectEmptyCell('D4');
    });

    it('should change puzzle', async () => {
      await game.menuBar.toggle();
      await game.menuBar.selectChangePuzzle();

      await game.changePuzzleModal.waitForVisible();
      await game.changePuzzleModal.selectDifficulty('Extreme');
      await game.changePuzzleModal.selectSize(9);
      await game.changePuzzleModal.selectId(23);
      await game.changePuzzleModal.clickNext();
      await game.changePuzzleModal.clickOk();
      await game.changePuzzleModal.waitForHidden();

      expect(game.board.getSize()).toBe(9);
      expect(game.board.getCellValue('A1')).toBe(3);
    });
  });
});
