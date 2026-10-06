
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
  FormsModule,
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
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
  FormsModule
  ],

  templateUrl:
    './product-variants.component.html',

  styleUrls:
    ['./product-variants.component.scss']
})
export class ProductVariantsComponent {

  private readonly fb =
    inject(FormBuilder);


  @Input({ required: true })
  variants!: FormArray;


  @Input()
  sizes: Size[] = [];


  @Input()
  heelSizes: HeelSize[] = [];


  @Input()
  isLoading = false;


  /*
   * Temporary selections used only while
   * creating a new variant.
   */
  selectedSizeId:
    number | null = null;

  selectedHeelSizeIds:
    number[] = [];


  /*
   * Controls the custom heel dropdown.
   */
  heelDropdownOpen = false;


  /* ========================================= */
  /* ADD VARIANT */
  /* ========================================= */

  addVariant(): void {

    /*
     * Keep the old "Add" behaviour.
     *
     * If nothing is selected, create one empty
     * variant exactly like before.
     */
    if (
      this.selectedSizeId === null &&
      this.selectedHeelSizeIds.length === 0
    ) {

      this.variants.insert(
        0,
        this.createVariant()
      );

      return;

    }


    /*
     * No heel sizes selected:
     *
     * create one Size-only variant.
     */
    if (
      this.selectedHeelSizeIds.length === 0
    ) {

      if (
        this.selectedSizeId === null
      ) {

        this.variants.insert(
          0,
          this.createVariant()
        );

        return;

      }


      if (
        this.variantExists(
          this.selectedSizeId,
          null
        )
      ) {

        this.resetBuilder();

        return;

      }


      this.variants.insert(
        0,
        this.createVariant(
          this.selectedSizeId,
          null
        )
      );

      this.resetBuilder();

      return;

    }


    /*
     * Heel sizes selected.
     *
     * Create one backend variant for every
     * selected heel size.
     *
     * Example:
     *
     * Size 38
     * Heels 5, 7, 9
     *
     * becomes:
     *
     * 38 / 5
     * 38 / 7
     * 38 / 9
     */
    const variantsToAdd =
      this.selectedHeelSizeIds
        .filter(
          heelSizeId =>
            !this.variantExists(
              this.selectedSizeId,
              heelSizeId
            )
        );


    /*
     * Add in reverse order because insert(0)
     * puts each new variant at the beginning.
     */
    for (
      let i =
        variantsToAdd.length - 1;
      i >= 0;
      i--
    ) {

      this.variants.insert(
        0,
        this.createVariant(
          this.selectedSizeId,
          variantsToAdd[i]
        )
      );

    }


    this.resetBuilder();

  }


  /* ========================================= */
  /* REMOVE VARIANT */
  /* ========================================= */

  removeVariant(
    index: number
  ): void {

    this.variants.removeAt(
      index
    );

  }


  /* ========================================= */
  /* CREATE VARIANT */
  /* ========================================= */

  private createVariant(
    sizeId: number | null = null,
    heelSizeId: number | null = null
  ): FormGroup {

    return this.fb.group(
      {

        /*
         * null = new variant.
         */
        id: [
          null
        ],

        sizeId: [
          sizeId
        ],

        heelSizeId: [
          heelSizeId
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


  /* ========================================= */
  /* VARIANT EXISTS */
  /* ========================================= */

  private variantExists(
    sizeId: number | null,
    heelSizeId: number | null
  ): boolean {

    return this.variants.controls.some(
      variant => {

        const existingSizeId =
          variant.get(
            'sizeId'
          )?.value ?? null;

        const existingHeelSizeId =
          variant.get(
            'heelSizeId'
          )?.value ?? null;

        return (
          existingSizeId === sizeId &&
          existingHeelSizeId === heelSizeId
        );

      }
    );

  }


  /* ========================================= */
  /* HEEL DROPDOWN */
  /* ========================================= */

  toggleHeelDropdown(): void {

    this.heelDropdownOpen =
      !this.heelDropdownOpen;

  }


  closeHeelDropdown(): void {

    this.heelDropdownOpen =
      false;

  }


  /* ========================================= */
  /* HEEL SELECTION */
  /* ========================================= */

  toggleHeelSize(
    heelSizeId: number
  ): void {

    const index =
      this.selectedHeelSizeIds.indexOf(
        heelSizeId
      );


    if (index >= 0) {

      this.selectedHeelSizeIds.splice(
        index,
        1
      );

    } else {

      this.selectedHeelSizeIds.push(
        heelSizeId
      );

    }

    /*
     * Replace the array reference so Angular
     * updates immediately.
     */
    this.selectedHeelSizeIds =
      [...this.selectedHeelSizeIds];

  }


  isHeelSelected(
    heelSizeId: number
  ): boolean {

    return this.selectedHeelSizeIds.includes(
      heelSizeId
    );

  }


  /* ========================================= */
  /* SELECTED HEEL LABEL */
  /* ========================================= */

  getSelectedHeelLabel(): string {

    if (
      this.selectedHeelSizeIds.length === 0
    ) {

      return 'products.VARIANTS.SELECT_HEEL_SIZES';

    }


    if (
      this.selectedHeelSizeIds.length === 1
    ) {

      const heel =
        this.heelSizes.find(
          item =>
            item.id ===
            this.selectedHeelSizeIds[0]
        );


      return heel?.name ??
        'products.VARIANTS.SELECT_HEEL_SIZES';

    }


    return `${this.selectedHeelSizeIds.length} selected`;

  }


  /* ========================================= */
  /* RESET BUILDER */
  /* ========================================= */

  private resetBuilder(): void {

    this.selectedSizeId =
      null;

    this.selectedHeelSizeIds =
      [];

    this.heelDropdownOpen =
      false;

  }


  /* ========================================= */
  /* VALIDATION */
  /* ========================================= */

  private variantSelectionValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const sizeId =
      control.get(
        'sizeId'
      )?.value;

    const heelSizeId =
      control.get(
        'heelSizeId'
      )?.value;


    if (
      sizeId === null &&
      heelSizeId === null
    ) {

      return {
        variantSelectionRequired:
          true
      };

    }


    return null;

  }


  /* ========================================= */
  /* INVALID VARIANT */
  /* ========================================= */

  isVariantInvalid(
    variant: AbstractControl
  ): boolean {

    return (
      variant.hasError(
        'variantSelectionRequired'
      ) &&
      (
        variant.get(
          'sizeId'
        )?.touched ||
        variant.get(
          'heelSizeId'
        )?.touched
      ) === true
    );

  }


  /* ========================================= */
  /* SELECTED HEEL COUNT */
  /* ========================================= */

  get selectedHeelCount(): number {

    return this.selectedHeelSizeIds.length;

  }

}
