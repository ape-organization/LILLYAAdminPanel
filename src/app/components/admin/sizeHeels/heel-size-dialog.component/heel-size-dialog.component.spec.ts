import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeelSizeDialogComponent } from './heel-size-dialog.component';

describe('HeelSizeDialogComponent', () => {
  let component: HeelSizeDialogComponent;
  let fixture: ComponentFixture<HeelSizeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeelSizeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeelSizeDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
