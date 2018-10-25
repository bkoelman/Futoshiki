import { ElementFinder, browser } from 'protractor';
import { protractor } from 'protractor/built/ptor';
import { WaitTimeout } from './timeout';

export class ElementFacilities {
  static async clickOnElement(targetElement: ElementFinder) {
    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(targetElement), WaitTimeout);
    await targetElement.click();
  }
}
