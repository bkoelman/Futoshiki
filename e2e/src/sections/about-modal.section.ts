import { $ } from 'protractor';
import { BootstrapModal } from '../bootstrap-modal';

export class AboutModalSection extends BootstrapModal {
  protected readonly root = $('app-about-modal');
}
