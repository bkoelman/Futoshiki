import { $ } from 'protractor';
import { ElementFacilities } from '../element-facilities';

export class HintExplanationBoxSection {
  private _root = $('app-hint-explanation-box');

  async isVisible(): Promise<boolean> {
    return this._root.$('.alert-warning').isPresent();
  }

  async close() {
    const closeButton = this._root.$('button.close');
    await ElementFacilities.clickOnElement(closeButton);
  }

  async getText(): Promise<string> {
    return this._root.$('.alert-warning').getText();
  }
}
