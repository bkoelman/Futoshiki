import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html'
})
export class MenuBarComponent implements OnInit {
  @Input()
  restartEnabled!: boolean;
  @Input()
  newGameEnabled!: boolean;
  @Input()
  changePuzzleEnabled!: boolean;
  @Input()
  settingsEnabled!: boolean;
  @Output()
  restartClicked = new EventEmitter();
  @Output()
  newGameClicked = new EventEmitter();
  @Output()
  changePuzzleClicked = new EventEmitter();
  @Output()
  settingsClicked = new EventEmitter();
  @Output()
  isOpenChanged = new EventEmitter<boolean>();

  trackerImageUrl = '';

  get isMenuOpened(): boolean {
    const isClosed = $('.navbar-toggler').hasClass('collapsed');
    return !isClosed;
  }

  constructor(private _zone: NgZone) {}

  ngOnInit() {
    $(document).ready(() => {
      $(document).click((event: JQuery.Event) => {
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

    setTimeout(() => {
      this.trackerImageUrl = '//counter.websiteout.net/compte.php?S=' + encodeURI(window.location.hostname) + '&C=35&D=0&N=0&M=1';
    }, 10000);
  }

  private isClickOutsideMenuComponent(clickTarget: JQuery<EventTarget>): boolean {
    return !clickTarget.hasClass('navbar') && clickTarget.parents('.navbar').length === 0;
  }

  private isClickOnHamburgerIcon(clickTarget: JQuery<EventTarget>): boolean {
    return clickTarget.parents('button.navbar-toggler').length > 0;
  }

  private doClickOnHamburgerIcon() {
    $('button.navbar-toggler').click();
  }

  onMenuItemClicked(event: EventEmitter<{}> | undefined, condition: boolean) {
    if (condition) {
      this.doClickOnHamburgerIcon();
      this.onIsOpenChanged();

      if (event) {
        event.emit();
      }
    }

    return false;
  }

  onIsOpenChanged() {
    this._zone.run(() => {
      this.isOpenChanged.emit(this.isMenuOpened);
    });
  }
}
