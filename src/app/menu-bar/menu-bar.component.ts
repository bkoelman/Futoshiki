import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html'
})
export class MenuBarComponent implements OnInit {
  @Input() restartEnabled!: boolean;
  @Output() restartClicked = new EventEmitter();
  @Output() isOpenChanged = new EventEmitter<boolean>();

  get isMenuOpened(): boolean {
    const isClosed = $('.navbar-toggler').hasClass('collapsed');
    return !isClosed;
  }

  constructor(private _zone: NgZone) {
  }

  ngOnInit() {
    $(document).ready(() => {
      $(document).click(event => {
        const clickTarget = $(event.target);

        if (this.isMenuOpened && this.isClickOutsideMenuComponent(clickTarget)) {
          this.doClickOnHamburgerIcon();
          this.onIsOpenChanged();
          return;
        }

        if (this.isClickOnHamburgerIcon(clickTarget)) {
          this.onIsOpenChanged();
        }
      });
    });
  }

  private isClickOutsideMenuComponent(clickTarget: JQuery<Document>): boolean {
    return !clickTarget.hasClass('navbar') && clickTarget.parents('.navbar').length === 0;
  }

  private isClickOnHamburgerIcon(clickTarget: JQuery<Document>): boolean {
    return clickTarget.parents('button.navbar-toggler').length > 0;
  }

  private doClickOnHamburgerIcon() {
    $('button.navbar-toggler').click();
  }

  onMenuItemClicked(event: EventEmitter<{}>, condition: boolean) {
    if (condition) {
      this.doClickOnHamburgerIcon();
      this.onIsOpenChanged();

      event.emit();
    }

    return false;
  }

  onIsOpenChanged() {
    this._zone.run(() => {
      this.isOpenChanged.emit(this.isMenuOpened);
    });
  }
}
