import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChangePuzzleModalComponent } from './change-puzzle-modal.component';
import { EnumNamesToArrayPipe } from '../../enum-names-to-array.pipe';

describe('ChangePuzzleModalComponent', () => {
  let component: ChangePuzzleModalComponent;
  let fixture: ComponentFixture<ChangePuzzleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ChangePuzzleModalComponent, EnumNamesToArrayPipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePuzzleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
