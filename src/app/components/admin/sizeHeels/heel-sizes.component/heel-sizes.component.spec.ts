import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeelSizesComponent } from './heel-sizes.component';

describe('HeelSizesComponent', () => {
  let component: HeelSizesComponent;
  let fixture: ComponentFixture<HeelSizesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeelSizesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeelSizesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
