import { browser } from 'protractor';
import { GameSection } from './sections/game.section';

export class AppPage {
  game = new GameSection();

  async navigateTo() {
    await browser.get('/?noCookies=1');
  }

  async loadCookieState(state: { save?: string | undefined; settings?: string | undefined }) {
    if (state.save !== undefined || state.settings !== undefined) {
      await browser.manage().deleteAllCookies();

      if (state.save !== undefined) {
        await browser.manage().addCookie({
          name: 'save',
          value: state.save
        });
      }

      if (state.settings !== undefined) {
        await browser.manage().addCookie({
          name: 'settings',
          value: state.settings
        });
      }

      await browser.get('/');
    }
  }
}
