import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChangePuzzleComponent } from './change-puzzle.component';
import { EnumNamesToArrayPipe } from '../enum-names-to-array.pipe';

describe('ChangePuzzleComponent', () => {
  let component: ChangePuzzleComponent;
  let fixture: ComponentFixture<ChangePuzzleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      declarations: [
        ChangePuzzleComponent,
        EnumNamesToArrayPipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
