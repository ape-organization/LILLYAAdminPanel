
import {
  Component,
  Input
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  FormArray,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  Size
} from '../../../../models/size.model';

import {
  HeelSize
} from '../../../../models/heel-size.model';

@Component({
  selector: 'app-product-variants',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslatePipe
  ],

  templateUrl: './product-variants.component.html',
  styleUrls: ['./product-variants.component.scss']
})
export class ProductVariantsComponent {
  private readonly fb = new FormBuilder();

  @Input({ required: true })
  variants!: FormArray;

  @Input()
  sizes: Size[] = [];

  @Input()
  heelSizes: HeelSize[] = [];

  @Input()
  isLoading = false;

  selectedSizeId: number | null = null;

  selectedHeelSizeIds: number[] = [];

  heelDropdownOpen = false;

  get variantControls(): AbstractControl[] {
    return this.variants?.controls ?? [];
  }

  addVariant(): void {
    if (
      this.isLoading ||
      !this.variants ||
      this.selectedSizeId === null ||
      this.selectedHeelSizeIds.length === 0
    ) {
      return;
    }

    const sizeId = Number(this.selectedSizeId);

    for (const selectedHeelSizeId of this.selectedHeelSizeIds) {
      const heelSizeId = Number(selectedHeelSizeId);

      // Prevent duplicate size + heel-size combinations.
      const alreadyExists = this.variants.controls.some(
        variant =>
          Number(variant.get('sizeId')?.value) === sizeId &&
          Number(variant.get('heelSizeId')?.value) === heelSizeId
      );

      if (alreadyExists) {
        continue;
      }

      this.variants.push(
        this.fb.group({
          id: [null],

          sizeId: [
            sizeId,
            Validators.required
          ],

          heelSizeId: [
            heelSizeId,
            Validators.required
          ],

          stockQuantity: [
            0,
            [
              Validators.required,
              Validators.min(0)
            ]
          ],

          // Independent of stockQuantity.
          isInStock: [
            true,
            Validators.required
          ]
        })
      );
    }

    // Clear the selected heel sizes after adding variants.
    this.selectedHeelSizeIds = [];
    this.heelDropdownOpen = false;
  }

  removeVariant(index: number): void {
    if (
      !this.variants ||
      index < 0 ||
      index >= this.variants.length
    ) {
      return;
    }

    this.variants.removeAt(index);
  }

  setVariantStock(
    variant: AbstractControl,
    isInStock: boolean
  ): void {
    // Change only IsInStock.
    // StockQuantity remains untouched.
    const control = variant.get('isInStock');

    control?.setValue(isInStock);
    control?.markAsDirty();
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  isVariantInStock(
    variant: AbstractControl
  ): boolean {
    return variant.get('isInStock')?.value === true;
  }

  isVariantInvalid(
    variant: AbstractControl
  ): boolean {
    const sizeId = variant.get('sizeId')?.value;
    const heelSizeId = variant.get('heelSizeId')?.value;

    return (
      sizeId === null ||
      sizeId === undefined ||
      heelSizeId === null ||
      heelSizeId === undefined
    );
  }

  toggleHeelDropdown(): void {
    this.heelDropdownOpen = !this.heelDropdownOpen;
  }

  isHeelSelected(heelSizeId: number): boolean {
    return this.selectedHeelSizeIds.includes(heelSizeId);
  }

  toggleHeelSize(heelSizeId: number): void {
    if (this.isHeelSelected(heelSizeId)) {
      this.selectedHeelSizeIds =
        this.selectedHeelSizeIds.filter(
          id => id !== heelSizeId
        );
    } else {
      this.selectedHeelSizeIds = [
        ...this.selectedHeelSizeIds,
        heelSizeId
      ];
    }
  }

  getSelectedHeelLabel(): string {
    return this.heelSizes
      .filter(heel =>
        this.selectedHeelSizeIds.includes(Number(heel.id))
      )
      .map(heel => heel.name)
      .join(', ');
  }

  trackByIndex(index: number): number {
    return index;
  }
}
