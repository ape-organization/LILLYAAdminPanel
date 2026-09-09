import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeDialogComponent } from './size-dialog.component';

describe('SizeDialogComponent', () => {
  let component: SizeDialogComponent;
  let fixture: ComponentFixture<SizeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SizeDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
