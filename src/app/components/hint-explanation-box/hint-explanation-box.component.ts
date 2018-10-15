import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-hint-explanation-box',
  templateUrl: './hint-explanation-box.component.html'
})
export class HintExplanationBoxComponent implements OnInit {
  @Input() isEnabled!: boolean;

  isDismissed = false;
  explanationText = '';

  ngOnInit() {
  }

  show(text: string) {
    this.isDismissed = false;
    this.explanationText = text;
  }

  hide() {
    this.show('');
  }

  onCloseClick() {
    this.isDismissed = true;
  }
}
