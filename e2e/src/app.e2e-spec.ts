import { AppPage } from './app.po';
import { GameSection } from './sections/game.section';

describe('Futoshiki', () => {
  let page: AppPage;
  let game: GameSection;

  beforeEach(async () => {
    page = new AppPage();
    game = page.game;
    await page.navigateTo();
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

    it('should apply hints to solve the board', async () => {
      for (let index = 0; index < 25; index++) {
        await game.buttonBar.clickHintBoard();
      }

      await game.winModal.waitForVisible();
      await game.winModal.clickNewGame();
    });

    it('should apply hints on cells', async () => {
      await game.buttonBar.clickHintBoard();

      await game.provideHintForCell('D4');
      await game.expectCellCandidates('D4', [2, 3]);

      await game.typeHintForCell('D3');
      await game.expectCellCandidates('D3', [1, 2]);
    });

    // TODO: Lose the game
  });

  describe('Settings', () => {
    it('should auto-cleanup candidates', async () => {
      const saveState = 'D2-S5-I7654-T00000029-Bff05ff04ff030005ff02ff04ff0300030003ff05ff01ff0500060006ff04ff02ff01ff050000ff03ff03ff02ff04ff05ff01';
      const autoCleanupOn = 'ACC1-NWM0-SHE0';
      const autoCleanupOff = 'ACC0-NWM0-SHE0';

      await page.loadCookieState({
        save: saveState,
        settings: autoCleanupOn
      });

      await game.setCellValue('B4', 2);
      await game.expectCellCandidates('B3', [1]);
      await game.expectCellCandidates('C4', [3]);

      await page.navigateTo();
      await page.loadCookieState({
        save: saveState,
        settings: autoCleanupOff
      });

      await game.setCellValue('B4', 2);
      await game.expectCellCandidates('B3', [1, 2]);
      await game.expectCellCandidates('C4', [2, 3]);
    });

    it('should notify on invalid move', async () => {
      const saveState = 'D2-S5-I7654-T00000022-Bff05ff04ff030000ff02ff04ff0300000000ff05ff01ff0500000000ff04ff02ff01ff050000ff03ff03ff02ff04ff05ff01';
      const notifyWrongMovesOn = 'ACC0-NWM1-SHE0';
      const notifyWrongMovesOff = 'ACC0-NWM0-SHE0';

      await page.loadCookieState({
        save: saveState,
        settings: notifyWrongMovesOn
      });

      await game.setCellValue('B4', 5);

      expect(await game.board.hasErrorInCell('B5')).toBeTruthy();
      expect(await game.board.hasErrorInCell('E4')).toBeTruthy();
      expect(await game.board.hasErrorInOperator('B4', 'right')).toBeTruthy();

      await game.board.waitForErrorCompleted();
      await game.expectEmptyCell('B4');

      await page.navigateTo();
      await page.loadCookieState({
        save: saveState,
        settings: notifyWrongMovesOff
      });

      await game.setCellValue('B4', 5);

      expect(await game.board.hasErrorInCell('B5')).toBeFalsy();
      expect(await game.board.hasErrorInCell('E4')).toBeFalsy();
      expect(await game.board.hasErrorInOperator('B4', 'right')).toBeFalsy();

      await game.expectCellValue('B4', 5);
    });

    it('should notify on invalid candidate move', async () => {
      const saveState = 'D2-S5-I7654-T00000019-Bff05ff04ff030000ff02ff04ff0300000000ff05ff01ff0500000000ff04ff02ff01ff050000ff03ff03ff02ff04ff05ff01';
      const notifyWrongMovesOn = 'ACC0-NWM1-SHE0';
      const notifyWrongMovesOff = 'ACC0-NWM0-SHE0';

      await page.loadCookieState({
        save: saveState,
        settings: notifyWrongMovesOn
      });

      await game.setCellValue('C4', 5);

      expect(await game.board.hasErrorInCell('C2')).toBeTruthy();
      expect(await game.board.hasErrorInCell('E4')).toBeTruthy();
      expect(await game.board.hasErrorInOperator('D4', 'up')).toBeTruthy();

      await game.board.waitForErrorCompleted();
      await game.expectEmptyCell('C4');

      await page.navigateTo();
      await page.loadCookieState({
        save: saveState,
        settings: notifyWrongMovesOff
      });

      await game.setCellValue('C4', 5);

      expect(await game.board.hasErrorInCell('C2')).toBeFalsy();
      expect(await game.board.hasErrorInCell('E4')).toBeFalsy();
      expect(await game.board.hasErrorInOperator('D4', 'up')).toBeFalsy();

      await game.expectCellValue('C4', 5);
    });

    it('should show hint explanation', async () => {
      const saveState = 'D1-S5-I1-T00000038-B001f001f001d001f001f001f001f001d001f001f001d001d0000001d001d001f001f001d001f001f0000001f001d001f001f';
      const showExplanationsOn = 'ACC0-NWM0-SHE1';
      const showExplanationsOff = 'ACC0-NWM0-SHE0';

      await page.loadCookieState({
        save: saveState,
        settings: showExplanationsOn
      });

      expect(await game.board.isRulerVisible()).toBeTruthy();

      await game.buttonBar.clickHintBoard();
      expect(await game.hintExplanationBox.isVisible()).toBeTruthy();
      expect(await game.hintExplanationBox.getText()).toContain(
        "Naked single (4) in cell E1 eliminated '4' from 8 other cells in related row and column."
      );

      await game.hintExplanationBox.close();
      expect(await game.hintExplanationBox.isVisible()).toBeFalsy();

      await game.provideHintForCell('C5');
      expect(await game.hintExplanationBox.isVisible()).toBeTruthy();
      expect(await game.hintExplanationBox.getText()).toContain('Operators around C5 reduced candidates.');

      await game.hintExplanationBox.close();
      expect(await game.hintExplanationBox.isVisible()).toBeFalsy();

      await page.navigateTo();
      await page.loadCookieState({
        save: saveState,
        settings: showExplanationsOff
      });

      expect(await game.board.isRulerVisible()).toBeFalsy();

      await game.buttonBar.clickHintBoard();
      expect(await game.hintExplanationBox.isVisible()).toBeFalsy();
    });
  });

  describe('Puzzle management', () => {
    it('should open and close menu', async () => {
      expect(game.menuBar.getBrandText()).toEqual('Futoshiki');
      await game.menuBar.toggle();
      await game.menuBar.toggle();
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

    it('should display and remember settings', async () => {
      await game.menuBar.toggle();
      await game.menuBar.selectSettings();

      await game.settingsModal.waitForVisible();
      await game.settingsModal.clickAutoCleanCandidates();
      await game.settingsModal.clickNotifyOnWrongMoves();
      await game.settingsModal.clickShowHintExplanations();
      await game.settingsModal.clickOk();
      await game.settingsModal.waitForHidden();

      await game.menuBar.toggle();
      await game.menuBar.selectSettings();

      await game.settingsModal.waitForVisible();
      expect(await game.settingsModal.isAutoCleanCandidatesChecked()).toBeFalsy();
      expect(await game.settingsModal.isNotifyOnWrongMovesChecked()).toBeTruthy();
      expect(await game.settingsModal.isShowHintExplanationsChecked()).toBeTruthy();
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
