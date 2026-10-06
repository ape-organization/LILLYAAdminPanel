
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';

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
  environment
} from '../../../../../environments/environment';


export interface ProductImageItem {

  /*
   * This is optional because the API Product
   * response no longer provides ProductImage IDs.
   *
   * It can still be used internally if another
   * flow provides an ID.
   */
  id?: number;

  /*
   * Existing API image URL.
   *
   * IMPORTANT:
   * Keep this value when replacing an existing
   * image with a new file.
   */
  imageUrl?: string | null;

  /*
   * New uploaded file.
   */
  file?: File;

  /*
   * Browser preview URL.
   */
  previewUrl: string;

  /*
   * Current display order.
   */
  sortOrder: number;

  /*
   * True for newly selected files.
   */
  isNew: boolean;
}


@Component({
  selector: 'app-product-images',

  standalone: true,

  imports: [
    CommonModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],

  templateUrl:
    './product-images.component.html',

  styleUrls:
    ['./product-images.component.scss']
})
export class ProductImagesComponent {


  /* ========================================= */
  /* EXISTING IMAGES */
  /* ========================================= */

  @Input()
  set existingImages(
    value: string[] | null | undefined
  ) {

    /*
     * No existing images.
     */
    if (!value?.length) {

      this.images = [];

      this.emitChange();

      return;

    }


    /*
     * Product.images is already ordered by the API:
     *
     * images[0] = SortOrder 0
     * images[1] = SortOrder 1
     * images[2] = SortOrder 2
     *
     * Therefore we do NOT sort by properties
     * such as image.sortOrder.
     */

    this.images =
      value
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
             * Keep the original API URL.
             *
             * This is important during update because
             * the backend uses ImageUrl to identify
             * an existing image.
             */
            imageUrl:
              imageUrl,

            /*
             * Convert relative API URL to the
             * complete URL used by the browser.
             */
            previewUrl:
              this.getImage(
                imageUrl
              ),

            /*
             * API array position is the sort order.
             */
            sortOrder:
              index,

            /*
             * This is an existing image.
             */
            isNew:
              false

          })
        );

  }


  /* ========================================= */
  /* OUTPUT */
  /* ========================================= */

  @Output()
  imagesChange =
    new EventEmitter<ProductImageItem[]>();


  /* ========================================= */
  /* INTERNAL IMAGES */
  /* ========================================= */

  images:
    ProductImageItem[] = [];


  /* ========================================= */
  /* IMAGE URL */
  /* ========================================= */

  getImage(
    url: string | null | undefined
  ): string {

    if (!url) {

      return '';

    }


    /*
     * Already a complete URL or browser
     * object URL.
     */
    if (
      url.startsWith(
        'http://'
      ) ||
      url.startsWith(
        'https://'
      ) ||
      url.startsWith(
        'blob:'
      )
    ) {

      return url;

    }


    /*
     * Relative API image path.
     */
    return `${environment.imageBaseUrl}${url}`;

  }


  /* ========================================= */
  /* SELECT FILES */
  /* ========================================= */

  onFilesSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files?.length
    ) {

      return;

    }


    const files =
      Array.from(
        input.files
      );


    for (
      const file of files
    ) {

      /*
       * Ignore non-image files.
       */
      if (
        !file.type.startsWith(
          'image/'
        )
      ) {

        continue;

      }


      const previewUrl =
        URL.createObjectURL(
          file
        );


      this.images.push({

        /*
         * No imageUrl for a brand-new image.
         */
        imageUrl:
          null,

        file,

        previewUrl,

        sortOrder:
          this.images.length,

        isNew:
          true

      });

    }


    this.updateSortOrders();

    this.emitChange();


    /*
     * Allows selecting the same file again.
     */
    input.value = '';

  }


  /* ========================================= */
  /* REMOVE IMAGE */
  /* ========================================= */

  removeImage(
    index: number
  ): void {

    const image =
      this.images[index];


    if (!image) {

      return;

    }


    /*
     * Only revoke browser object URLs.
     *
     * Existing API URLs must not be revoked.
     */
    if (
      image.isNew &&
      image.previewUrl.startsWith(
        'blob:'
      )
    ) {

      URL.revokeObjectURL(
        image.previewUrl
      );

    }


    this.images.splice(
      index,
      1
    );


    this.updateSortOrders();

    this.emitChange();

  }


  /* ========================================= */
  /* DRAG & DROP */
  /* ========================================= */

  drop(
    event: CdkDragDrop<ProductImageItem[]>
  ): void {

    moveItemInArray(
      this.images,
      event.previousIndex,
      event.currentIndex
    );


    this.updateSortOrders();

    this.emitChange();

  }


  /* ========================================= */
  /* UPDATE SORT ORDERS */
  /* ========================================= */

  private updateSortOrders(): void {

    this.images.forEach(
      (
        image,
        index
      ) => {

        image.sortOrder =
          index;

      }
    );

  }


  /* ========================================= */
  /* EMIT */
  /* ========================================= */

  private emitChange(): void {

    this.imagesChange.emit(
      [...this.images]
    );

  }


  /* ========================================= */
  /* DESTROY */
  /* ========================================= */

  ngOnDestroy(): void {

    for (
      const image
      of this.images
    ) {

      if (
        image.isNew &&
        image.previewUrl.startsWith(
          'blob:'
        )
      ) {

        URL.revokeObjectURL(
          image.previewUrl
        );

      }

    }

  }

}
