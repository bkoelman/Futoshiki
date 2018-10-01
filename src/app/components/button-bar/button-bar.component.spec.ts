import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBarComponent } from './button-bar.component';
import { RepeatPipe } from '../../repeat.pipe';

describe('ButtonBarComponent', () => {
  let component: ButtonBarComponent;
  let fixture: ComponentFixture<ButtonBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ButtonBarComponent,
        RepeatPipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
