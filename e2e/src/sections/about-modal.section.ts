import { $, browser, by, protractor } from 'protractor';
import { WaitTimeout } from '../timeout';

export class AboutModalSection {
  private static readonly _bootstrapFadeDurationInMilliseconds = 250;

  private _root = $('app-about-modal');

  async waitForVisible() {
    await browser.wait(protractor.ExpectedConditions.presenceOf(this._root.$('.show')), WaitTimeout);
    await browser.sleep(AboutModalSection._bootstrapFadeDurationInMilliseconds);
  }

  async waitForHidden() {
    await browser.wait(protractor.ExpectedConditions.stalenessOf($('body.modal-open')), WaitTimeout);
  }

  async close() {
    const closeButton = this._root.element(by.cssContainingText('.btn', 'Close'));
    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(closeButton), WaitTimeout);
    await closeButton.click();
  }
}
