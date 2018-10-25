import { BootstrapModal } from '../bootstrap-modal';
import { $, by } from 'protractor';
import { ElementFacilities } from '../element-facilities';

export class SettingsModalSection extends BootstrapModal {
  protected readonly root = $('app-settings-modal');

  async clickOk() {
    const okButton = this.root.element(by.cssContainingText('.btn', 'Ok'));
    await ElementFacilities.clickOnElement(okButton);
  }

  async isAutoCleanCandidatesChecked() {
    const checkBox = this.root.$('#AutoCleanCandidates');
    return await checkBox.isSelected();
  }

  async clickAutoCleanCandidates() {
    const checkBox = this.root.$('#AutoCleanCandidates');
    await ElementFacilities.clickOnElement(checkBox);
  }

  async isNotifyOnWrongMovesChecked() {
    const checkBox = this.root.$('#NotifyOnWrongMoves');
    return await checkBox.isSelected();
  }

  async clickNotifyOnWrongMoves() {
    const checkBox = this.root.$('#NotifyOnWrongMoves');
    await ElementFacilities.clickOnElement(checkBox);
  }

  async isShowHintExplanationsChecked() {
    const checkBox = this.root.$('#ShowHintExplanations');
    return await checkBox.isSelected();
  }

  async clickShowHintExplanations() {
    const checkBox = this.root.$('#ShowHintExplanations');
    await ElementFacilities.clickOnElement(checkBox);
  }
}
