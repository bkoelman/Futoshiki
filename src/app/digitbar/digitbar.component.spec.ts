import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitbarComponent } from './digitbar.component';

describe('DigitbarComponent', () => {
  let component: DigitbarComponent;
  let fixture: ComponentFixture<DigitbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DigitbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
