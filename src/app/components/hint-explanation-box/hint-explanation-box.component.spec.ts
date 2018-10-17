import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HintExplanationBoxComponent } from './hint-explanation-box.component';

describe('HintExplanationBoxComponent', () => {
  let component: HintExplanationBoxComponent;
  let fixture: ComponentFixture<HintExplanationBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HintExplanationBoxComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HintExplanationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
