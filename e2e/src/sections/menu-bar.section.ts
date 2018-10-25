import { $, browser, by, protractor } from 'protractor';
import { WaitTimeout } from '../timeout';
import { ElementFacilities } from '../element-facilities';

export class MenuBarSection {
  private _root = $('app-menu-bar');

  async getBrandText() {
    return await this._root.$('.navbar-brand').getText();
  }

  async toggle() {
    if (await this.isCollapsed()) {
      await this.expand();
    } else {
      await this.collapse();
    }
  }

  private async isCollapsed() {
    return await this._root.$('.navbar-toggler.collapsed').isPresent();
  }

  private async expand() {
    await this.clickHamburgerButton();
    await browser.wait(protractor.ExpectedConditions.presenceOf(this._root.$('.navbar-collapse.collapse.show')), WaitTimeout);
  }

  private async collapse() {
    await this.clickHamburgerButton();
    await browser.wait(protractor.ExpectedConditions.presenceOf(this._root.$('.navbar-collapse.collapse')), WaitTimeout);
  }

  private async clickHamburgerButton() {
    const hamburgerButton = this._root.$('.navbar-toggler');
    await ElementFacilities.clickOnElement(hamburgerButton);
  }

  async selectRestart() {
    const restartLink = this._root.element(by.cssContainingText('.nav-link', 'Restart'));
    await ElementFacilities.clickOnElement(restartLink);
  }

  async selectChangePuzzle() {
    const changePuzzleLink = this._root.element(by.cssContainingText('.nav-link', 'Change puzzle'));
    await ElementFacilities.clickOnElement(changePuzzleLink);
  }

  async selectAbout() {
    const aboutLink = this._root.element(by.cssContainingText('.nav-link', 'About'));
    await ElementFacilities.clickOnElement(aboutLink);
  }
}
