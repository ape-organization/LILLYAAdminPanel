import {
  Component,
  inject,
  Input
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  TranslatePipe
} from '@ngx-translate/core';
import { Size } from '../../../../models/size.model';
import { HeelSize } from '../../../../models/heel-size.model';




@Component({
  selector: 'app-product-variants',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],

  templateUrl: './product-variants.component.html',

  styleUrls: ['./product-variants.component.scss']
})
export class ProductVariantsComponent {

  private readonly fb = inject(FormBuilder);


  @Input({ required: true })
  variants!: FormArray;


  @Input()
  sizes: Size[] = [];


  @Input()
  heelSizes: HeelSize[] = [];


  @Input()
  isLoading = false;


  /**
   * Add a new empty variant.
   */
  addVariant(): void {

    this.variants.push(
      this.createVariant()
    );

  }


  /**
   * Remove a variant.
   */
  removeVariant(index: number): void {

    this.variants.removeAt(index);

  }


  /**
   * Create a variant form group.
   */
  private createVariant(): FormGroup {

    return this.fb.group(
      {
        sizeId: [
          null
        ],

        heelSizeId: [
          null
        ],

        stockQuantity: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      },
      {
        validators:
          this.variantSelectionValidator
      }
    );

  }


  /**
   * A variant must have at least
   * a Size OR a Heel Size.
   */
  private variantSelectionValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const sizeId =
      control.get('sizeId')?.value;

    const heelSizeId =
      control.get('heelSizeId')?.value;


    if (
      sizeId === null &&
      heelSizeId === null
    ) {

      return {
        variantSelectionRequired: true
      };

    }


    return null;

  }


  /**
   * Check if the current row
   * has a validation error.
   */
  isVariantInvalid(
    variant: AbstractControl
  ): boolean {

    return (
      variant.hasError(
        'variantSelectionRequired'
      ) &&
      (
        variant.get('sizeId')?.touched ||
        variant.get('heelSizeId')?.touched
      ) === true
    );

  }

}