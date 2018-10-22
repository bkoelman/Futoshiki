import { browser } from 'protractor';
import { GameSection } from './sections/game.section';

export class AppPage {
  game = new GameSection();

  navigateTo() {
    return browser.get('/?noCookies=1');
  }
}
