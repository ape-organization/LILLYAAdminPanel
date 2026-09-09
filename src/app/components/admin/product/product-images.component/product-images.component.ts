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
import { ProductImage } from '../../../../models/product.model';
import { TranslatePipe } from '@ngx-translate/core';




export interface ProductImageItem {

  id?: number;

  imageUrl?: string | null;

  file?: File;

  previewUrl: string;

  sortOrder: number;

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

  templateUrl: './product-images.component.html',

  styleUrls: ['./product-images.component.scss']
})
export class ProductImagesComponent {


  @Input()
  set existingImages(value: ProductImage[] | null | undefined) {

    if (!value) {
      this.images = [];
      return;
    }

    this.images = [...value]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(image => ({

        id: image.id,

        imageUrl: image.imageUrl,

        previewUrl: image.imageUrl ?? '',

        sortOrder: image.sortOrder,

        isNew: false

      }));

  }


  @Output()
  imagesChange =
    new EventEmitter<ProductImageItem[]>();


  images: ProductImageItem[] = [];


  onFilesSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const files =
      Array.from(input.files);

    for (const file of files) {

      if (!file.type.startsWith('image/')) {
        continue;
      }

      const previewUrl =
        URL.createObjectURL(file);

      this.images.push({

        file,

        previewUrl,

        sortOrder: this.images.length,

        isNew: true

      });

    }

    this.updateSortOrders();

    this.emitChange();

    // Allows selecting the same file again
    input.value = '';
  }


  removeImage(index: number): void {

    const image =
      this.images[index];

    if (image?.isNew) {

      URL.revokeObjectURL(
        image.previewUrl
      );

    }

    this.images.splice(index, 1);

    this.updateSortOrders();

    this.emitChange();
  }


  drop(event: CdkDragDrop<ProductImageItem[]>): void {

    moveItemInArray(
      this.images,
      event.previousIndex,
      event.currentIndex
    );

    this.updateSortOrders();

    this.emitChange();
  }


  private updateSortOrders(): void {

    this.images.forEach(
      (image, index) => {

        image.sortOrder = index;

      }
    );

  }


  private emitChange(): void {

    this.imagesChange.emit(
      [...this.images]
    );

  }


  ngOnDestroy(): void {

    for (const image of this.images) {

      if (image.isNew) {

        URL.revokeObjectURL(
          image.previewUrl
        );

      }

    }

  }

}