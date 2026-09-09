import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBasicInfoComponent } from './product-basic-info.component';

describe('ProductBasicInfoComponent', () => {
  let component: ProductBasicInfoComponent;
  let fixture: ComponentFixture<ProductBasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBasicInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBasicInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
