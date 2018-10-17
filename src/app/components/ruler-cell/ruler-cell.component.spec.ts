import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RulerCellComponent } from './ruler-cell.component';

describe('RulerCellComponent', () => {
  let component: RulerCellComponent;
  let fixture: ComponentFixture<RulerCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RulerCellComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulerCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
