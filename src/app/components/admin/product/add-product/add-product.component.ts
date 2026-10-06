
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

import {
  ProductImageItem,
  ProductImagesComponent
} from '../product-images.component/product-images.component';

import {
  ProductVariantsComponent
} from '../product-variants.component/product-variants.component';

import {
  ProductService
} from '../../../../services/product.service';

import {
  CategoryService
} from '../../../../services/category.service';

import {
  SizeService
} from '../../../../services/size.service';

import {
  HeelSizeService
} from '../../../../services/heel-size.service';

import {
  Product
} from '../../../../models/product.model';

import {
  Category
} from '../../../../models/category.model';

import {
  Size
} from '../../../../models/size.model';

import {
  HeelSize
} from '../../../../models/heel-size.model';

import {
  environment
} from '../../../../../environments/environment';


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

  private readonly fb =
    inject(FormBuilder);

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
        0
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

      this.product.set(
        data.product
      );

      this.isEditing.set(
        data.isEditing
      );

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


          if (
            this.isEditing() &&
            this.product()
          ) {

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

          id: [
            variant.id ?? null
          ],

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

    /*
     * Product.images is now string[].
     *
     * The API already returns the images ordered
     * by SortOrder:
     *
     * images[0] = first image
     * images[1] = second image
     * etc.
     *
     * Therefore we must NOT access:
     *
     * image.id
     * image.imageUrl
     * image.sortOrder
     *
     * here.
     */

    this.productImages =
      (product.images ?? [])
        .filter(
          imageUrl =>
            !!imageUrl &&
            imageUrl.trim().length > 0
        )
        .map(
          (
            imageUrl,
            index
          ) => ({

            /*
             * Keep the URL as the identity
             * of an existing image.
             *
             * The backend uses this URL to know
             * which existing ProductImage is being
             * kept/replaced.
             */
            imageUrl:
              imageUrl,

            /*
             * Full URL used only for preview.
             */
            previewUrl:
              this.getImageUrl(
                imageUrl
              ),

            /*
             * API array order is the
             * ProductImage.SortOrder.
             */
            sortOrder:
              index,

            /*
             * Existing database image.
             */
            isNew:
              false

          })
        );

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
      imageUrl.startsWith(
        'http://'
      ) ||
      imageUrl.startsWith(
        'https://'
      )
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

    /*
     * ProductImagesComponent controls the
     * current image list.
     *
     * Existing images retain imageUrl.
     * New images have file.
     */

    this.productImages =
      images.map(
        (
          image,
          index
        ) => ({

          ...image,

          sortOrder:
            index

        })
      );

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


    /*
     * Keep this validation disabled
     * exactly as in your current component.
     *
     * Variables are intentionally calculated
     * because the business rule can be enabled
     * later without changing the structure.
     */

    void actualPrice;
    void finalPrice;


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


    /*
     * Keep your current behaviour.
     */
    formData.append(
      'ActualPrice',
      String(0)
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
      (
        variant: any,
        index: number
      ) => {

        /*
         * Preserve the variant ID when editing.
         */
        if (
          variant.id !== null &&
          variant.id !== undefined
        ) {

          formData.append(
            `Variants[${index}].Id`,
            String(
              variant.id
            )
          );

        }


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

    /*
     * IMPORTANT:
     *
     * Existing images:
     *   ImageUrl = existing URL
     *   Image = null
     *
     * Replaced images:
     *   ImageUrl = OLD URL
     *   Image = NEW FILE
     *
     * New images:
     *   ImageUrl = omitted
     *   Image = NEW FILE
     *
     * Removed images:
     *   They simply do not appear here.
     *
     * This allows the backend to synchronize
     * the database using ImageUrl.
     */

    this.productImages.forEach(
      (
        image,
        index
      ) => {

        /*
         * Existing image identity.
         *
         * Keep the original URL even when
         * a replacement file is selected.
         */
        if (
          image.imageUrl &&
          image.imageUrl.trim().length > 0
        ) {

          formData.append(
            `Images[${index}].ImageUrl`,
            image.imageUrl
          );

        }


        /*
         * Always send the current display order.
         */
        formData.append(
          `Images[${index}].SortOrder`,
          String(index)
        );


        /*
         * New file or replacement file.
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

    this.errorMessage.set('');


    /* ===================================== */
    /* FORM VALIDATION */
    /* ===================================== */

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


    /* ===================================== */
    /* UPDATE */
    /* ===================================== */

    if (this.isEditing()) {

      this.productService
        .updateProduct(
          this.product()!.id,
          formData
        )
        .pipe(
          finalize(() => {

            this.isSubmitting.set(false);

          })
        )
        .subscribe({

          next: () => {

            this.dialogRef.close(
              true
            );

          },

          error: (
            error
          ) => {

            if (
              error.status === 409
            ) {

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

      return;

    }


    /* ===================================== */
    /* CREATE */
    /* ===================================== */

    this.productService
      .createProduct(
        formData
      )
      .pipe(
        finalize(() => {

          this.isSubmitting.set(false);

        })
      )
      .subscribe({

        next: () => {

          this.dialogRef.close(
            true
          );

        },

        error: (
          error
        ) => {

          if (
            error.status === 409
          ) {

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


  /* ========================================= */
  /* CANCEL */
  /* ========================================= */

  cancel(): void {

    this.dialogRef.close();

  }

}
