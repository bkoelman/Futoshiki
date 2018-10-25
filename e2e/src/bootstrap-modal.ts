import { $, ElementFinder, protractor, browser } from 'protractor';
import { WaitTimeout } from './timeout';
import { ElementFacilities } from './element-facilities';

export abstract class BootstrapModal {
  private static readonly _bootstrapFadeDurationInMilliseconds = 250;

  protected abstract readonly root: ElementFinder;

  async waitForVisible() {
    await browser.wait(protractor.ExpectedConditions.presenceOf(this.root.$('.show')), WaitTimeout);
    await browser.sleep(BootstrapModal._bootstrapFadeDurationInMilliseconds);
  }

  async waitForHidden() {
    await browser.wait(protractor.ExpectedConditions.stalenessOf($('body.modal-open')), WaitTimeout);
  }

  async close() {
    const closeButton = this.root.$('button.close');
    await ElementFacilities.clickOnElement(closeButton);
  }
}
