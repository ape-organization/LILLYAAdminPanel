import {
  Component,
  Inject,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  forkJoin,
  finalize
} from 'rxjs';
import { ProductImageItem, ProductImagesComponent } from '../product-images.component/product-images.component';
import { ProductVariantsComponent } from '../product-variants.component/product-variants.component';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { SizeService } from '../../../../services/size.service';
import { HeelSizeService } from '../../../../services/heel-size.service';
import { Product } from '../../../../models/product.model';
import { Category } from '../../../../models/category.model';
import { Size } from '../../../../models/size.model';
import { HeelSize } from '../../../../models/heel-size.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-add-product',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    TranslatePipe,

    ProductImagesComponent,
    ProductVariantsComponent
  ],

  templateUrl: './add-product.component.html',

  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly sizeService =
    inject(SizeService);

  private readonly heelSizeService =
    inject(HeelSizeService);


  private readonly dialogRef =
    inject(MatDialogRef<AddProductComponent>);


  /* ========================================= */
  /* DATA */
  /* ========================================= */

  readonly product =
    signal<Product | null>(null);


  readonly categories =
    signal<Category[]>([]);


  readonly sizes =
    signal<Size[]>([]);


  readonly heelSizes =
    signal<HeelSize[]>([]);


  /* ========================================= */
  /* STATE */
  /* ========================================= */

  readonly isLoading =
    signal(true);


  readonly isSubmitting =
    signal(false);


  readonly errorMessage =
    signal('');


  readonly isEditing =
    signal(false);


  /* ========================================= */
  /* IMAGES */
  /* ========================================= */

  productImages: ProductImageItem[] = [];


  /* ========================================= */
  /* FORM */
  /* ========================================= */

  readonly productForm =
    this.fb.group({

      nameEn: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],

      nameAr: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],

      actualPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      sellingPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      discountPercentage: [
        0,
        [
          Validators.min(0),
          Validators.max(100)
        ]
      ],

      stockQuantity: [
        0,
        [
          Validators.min(0)
        ]
      ],

      isInStock: [
        true,
        Validators.required
      ],

      categoryId: [
        null as number | null,
        Validators.required
      ],

      descriptionEn: [
        '',
        Validators.maxLength(5000)
      ],

      descriptionAr: [
        '',
        Validators.maxLength(5000)
      ],

      variants:
        this.fb.array([])

    });


  /* ========================================= */
  /* VARIANTS */
  /* ========================================= */

  get variants(): FormArray {

    return this.productForm.get(
      'variants'
    ) as FormArray;

  }


  /* ========================================= */
  /* CONSTRUCTOR */
  /* ========================================= */

  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: any | null
  ) {

    if (data) {

      this.product.set(data.product);

      this.isEditing.set(data.isEditing);

    }

  }


  /* ========================================= */
  /* INIT */
  /* ========================================= */

  ngOnInit(): void {

    this.loadLookups();

  }


  /* ========================================= */
  /* LOAD LOOKUPS */
  /* ========================================= */

  private loadLookups(): void {

//    this.isLoading.set(true);

    forkJoin({

      categories:
        this.categoryService.getCategories(),

      sizes:
        this.sizeService.getSizes(),

      heelSizes:
        this.heelSizeService.getHeelSizes()

    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({

        next: ({
          categories,
          sizes,
          heelSizes
        }) => {

          this.categories.set(
            categories
          );

          this.sizes.set(
            sizes
          );

          this.heelSizes.set(
            heelSizes
          );


          if (this.isEditing()) {

            this.patchProduct(
              this.product()!
            );

          }

        },

        error: () => {

          this.errorMessage.set(
            'LOAD_DATA'
          );

        }

      });

  }


  /* ========================================= */
  /* PATCH EDIT PRODUCT */
  /* ========================================= */

  private patchProduct(
    product: Product
  ): void {

    this.productForm.patchValue({

      nameEn:
        product.nameEn,

      nameAr:
        product.nameAr,

      actualPrice:
        product.actualPrice,

      sellingPrice:
        product.price,

      discountPercentage:
        product.discountPercentage ?? 0,

      stockQuantity:
        product.stockQuantity,

      isInStock:
        product.isInStock,

      categoryId:
        product.categoryId,

      descriptionEn:
        product.descriptionEn ?? '',

      descriptionAr:
        product.descriptionAr ?? ''

    });


    /* ===================================== */
    /* VARIANTS */
    /* ===================================== */

    this.variants.clear();


    for (
      const variant
      of product.variants ?? []
    ) {

      this.variants.push(

        this.fb.group({

          sizeId: [
            variant.sizeId ?? null
          ],

          heelSizeId: [
            variant.heelSizeId ?? null
          ],

          stockQuantity: [
            variant.stockQuantity ?? 0,
            [
              Validators.required,
              Validators.min(0)
            ]
          ]

        })

      );

    }


    /* ===================================== */
    /* IMAGES */
    /* ===================================== */

    this.productImages =
      (product.images ?? [])
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder
        )
        .map(image => ({

          id: image.id,

          imageUrl:
            image.imageUrl,

          previewUrl:
            this.getImageUrl(
              image.imageUrl
            ),

          sortOrder:
            image.sortOrder,

          isNew: false

        }));

  }


  /* ========================================= */
  /* IMAGE URL */
  /* ========================================= */

  private getImageUrl(
    imageUrl?: string | null
  ): string {

    if (!imageUrl) {
      return '';
    }


    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {

      return imageUrl;

    }


    const baseUrl =
      environment.imageBaseUrl;


    return `${baseUrl}${imageUrl}`;

  }


  /* ========================================= */
  /* IMAGE CHANGE */
  /* ========================================= */

  onImagesChange(
    images: ProductImageItem[]
  ): void {

    this.productImages =
      images;

  }


  /* ========================================= */
  /* PRICE AFTER DISCOUNT */
  /* ========================================= */

  getPriceAfterDiscount(): number {

    const price =
      Number(
        this.productForm.get(
          'sellingPrice'
        )?.value
      ) || 0;


    const discount =
      Number(
        this.productForm.get(
          'discountPercentage'
        )?.value
      ) || 0;


    return price -
      (
        price *
        discount /
        100
      );

  }


  /* ========================================= */
  /* PRICE VALIDATION */
  /* ========================================= */

  private validatePrice(): boolean {

    const actualPrice =
      Number(
        this.productForm.get(
          'actualPrice'
        )?.value
      ) || 0;


    const sellingPrice =
      Number(
        this.productForm.get(
          'sellingPrice'
        )?.value
      ) || 0;


    const discount =
      Number(
        this.productForm.get(
          'discountPercentage'
        )?.value
      ) || 0;


    const finalPrice =
      sellingPrice -
      (
        sellingPrice *
        discount /
        100
      );


    if (finalPrice < actualPrice) {

      this.errorMessage.set(
        'PRICE_BELOW_ACTUAL'
      );

      return false;

    }


    return true;

  }


  /* ========================================= */
  /* VARIANT VALIDATION */
  /* ========================================= */

  private validateVariants(): boolean {

    const combinations =
      new Set<string>();


    for (
      const variant
      of this.variants.controls
    ) {

      const sizeId =
        variant.get(
          'sizeId'
        )?.value ?? null;


      const heelSizeId =
        variant.get(
          'heelSizeId'
        )?.value ?? null;


      /* =================================== */
      /* AT LEAST ONE */
      /* =================================== */

      if (
        sizeId === null &&
        heelSizeId === null
      ) {

        this.errorMessage.set(
          'VARIANT_SELECTION'
        );

        variant.markAllAsTouched();

        return false;

      }


      /* =================================== */
      /* DUPLICATE */
      /* =================================== */

      const key =
        `${sizeId ?? ''}_${heelSizeId ?? ''}`;


      if (
        combinations.has(key)
      ) {

        this.errorMessage.set(
          'DUPLICATE_VARIANT'
        );

        return false;

      }


      combinations.add(key);

    }


    return true;

  }


  /* ========================================= */
  /* BUILD FORM DATA */
  /* ========================================= */

  private buildFormData(): FormData {

    const formData =
      new FormData();


    const value =
      this.productForm.getRawValue();


    /* ===================================== */
    /* BASIC DATA */
    /* ===================================== */

    formData.append(
      'NameEn',
      value.nameEn?.trim() ?? ''
    );


    formData.append(
      'NameAr',
      value.nameAr?.trim() ?? ''
    );


    formData.append(
      'DescriptionEn',
      value.descriptionEn?.trim() ?? ''
    );


    formData.append(
      'DescriptionAr',
      value.descriptionAr?.trim() ?? ''
    );


    formData.append(
      'Price',
      String(
        value.sellingPrice ?? 0
      )
    );


    formData.append(
      'ActualPrice',
      String(
        value.actualPrice ?? 0
      )
    );


    formData.append(
      'DiscountPercentage',
      String(
        value.discountPercentage ?? 0
      )
    );


    formData.append(
      'StockQuantity',
      String(
        value.stockQuantity ?? 0
      )
    );


    formData.append(
      'IsInStock',
      String(
        value.isInStock ?? true
      )
    );


    formData.append(
      'CategoryId',
      String(
        value.categoryId ?? ''
      )
    );


    /* ===================================== */
    /* VARIANTS */
    /* ===================================== */

    const variants =
      value.variants ?? [];


    variants.forEach(
      (variant: any, index: number) => {

        if (
          variant.sizeId !== null &&
          variant.sizeId !== undefined
        ) {

          formData.append(
            `Variants[${index}].SizeId`,
            String(
              variant.sizeId
            )
          );

        }


        if (
          variant.heelSizeId !== null &&
          variant.heelSizeId !== undefined
        ) {

          formData.append(
            `Variants[${index}].HeelSizeId`,
            String(
              variant.heelSizeId
            )
          );

        }


        formData.append(
          `Variants[${index}].StockQuantity`,
          String(
            variant.stockQuantity ?? 0
          )
        );

      }
    );


    /* ===================================== */
    /* IMAGES */
    /* ===================================== */

    this.productImages.forEach(
      (image, index) => {

        /*
         * Existing image ID
         */
        if (image.id) {

          formData.append(
            `Images[${index}].Id`,
            String(image.id)
          );

        }


        /*
         * Existing image URL
         */
        if (image.imageUrl) {

          formData.append(
            `Images[${index}].ImageUrl`,
            image.imageUrl
          );

        }


        /*
         * Always send the current order
         */
        formData.append(
          `Images[${index}].SortOrder`,
          String(index)
        );


        /*
         * New uploaded image
         */
        if (image.file) {

          formData.append(
            `Images[${index}].Image`,
            image.file
          );

        }

      }
    );


    return formData;

  }


  /* ========================================= */
  /* SAVE */
  /* ========================================= */

  save(): void {
console.log("save")
    this.errorMessage.set('');


    /* ===================================== */
    /* FORM VALIDATION */
    /* ===================================== */
console.log(this.productForm.invalid)
    if (
      this.productForm.invalid
    ) {

      this.productForm.markAllAsTouched();

      this.errorMessage.set(
        'INVALID_FORM'
      );

      return;

    }


    /* ===================================== */
    /* PRICE */
    /* ===================================== */

    if (
      !this.validatePrice()
    ) {

      return;

    }


    /* ===================================== */
    /* VARIANTS */
    /* ===================================== */

    if (
      !this.validateVariants()
    ) {

      return;

    }


    /* ===================================== */
    /* SUBMIT */
    /* ===================================== */

    this.isSubmitting.set(true);


    const formData =
      this.buildFormData();

console.log(this.isEditing())
console.log(this.product()!.id)
    if (this.isEditing()) {

  console.log('CALLING UPDATE PRODUCT');

  this.productService
    .updateProduct(
      this.product()!.id,
      formData
    )
    .subscribe({

      next: () => {

        console.log('UPDATE SUCCESS');

        this.isSubmitting.set(false);

        this.dialogRef.close(true);

      },

      error: (error) => {

        console.error('UPDATE ERROR:', error);

        this.isSubmitting.set(false);

        if (error.status === 409) {

          this.errorMessage.set(
            'PRODUCT WITH SAME ALREADY EXISTS'
          );

        } else {

          this.errorMessage.set(
            'PRODUCT SAVE FAILED'
          );

        }

      }

    });

} else {

  console.log('CALLING CREATE PRODUCT');

  this.productService
    .createProduct(formData)
    .subscribe({

      next: () => {

        console.log('CREATE SUCCESS');

        this.isSubmitting.set(false);

        this.dialogRef.close(true);

      },

      error: (error) => {

        console.error('CREATE ERROR:', error);

        this.isSubmitting.set(false);
if (error.status === 409) {

          this.errorMessage.set(
            'PRODUCT WITH SAME ALREADY EXISTS'
          );

        } else {

          this.errorMessage.set(
            'PRODUCT SAVE FAILED'
          );

        }

      }

    });

}

  }


  /* ========================================= */
  /* CANCEL */
  /* ========================================= */

  cancel(): void {

    this.dialogRef.close();

  }

}