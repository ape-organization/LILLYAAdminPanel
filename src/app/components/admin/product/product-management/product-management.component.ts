import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatTableModule
} from '@angular/material/table';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  ProductService,
  PagedResponse
} from '../../../../services/product.service';

import {
  AddProductComponent
} from '../add-product/add-product.component';

import {
  environment
} from '../../../../../environments/environment';

import {
  ConfirmDeleteComponent
} from '../../../../shared/confirm-delete/confirm-delete.component';

import {
  Product
} from '../../../../models/product.model';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';


@Component({
  selector: 'app-product-management',

  standalone: true,

  imports: [
    TranslatePipe,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule
  ],

  templateUrl:
    './product-management.component.html',

  styleUrl:
    './product-management.component.scss'
})
export class ProductManagementComponent
  implements OnInit {


  // ==========================================================
  // SERVICES
  // ==========================================================

  private readonly productService =
    inject(ProductService);

  private readonly dialog =
    inject(MatDialog);

  private readonly translate =
    inject(TranslateService);


  // ==========================================================
  // API PAGE SIZE
  // ==========================================================

  private readonly apiPageSize = 50;


  // ==========================================================
  // DATA
  // ==========================================================

  readonly products =
    signal<Product[]>([]);

  readonly searchTerm =
    signal('');

  readonly isLoading =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);


  // ==========================================================
  // SERVER PAGINATION
  // ==========================================================

  readonly totalCount =
    signal(0);

  readonly totalPages =
    signal(0);

  readonly hasMore =
    signal(false);

  readonly currentApiPage =
    signal(1);


  // ==========================================================
  // API CACHE
  // ==========================================================

  private readonly pageCache =
    signal<Map<number, Product[]>>(
      new Map<number, Product[]>()
    );


  // ==========================================================
  // ALL PRODUCTS LOADED
  // ==========================================================

  readonly allProductsLoaded =
    computed(() => {

      const pages =
        this.totalPages();

      const cache =
        this.pageCache();

      return (
        pages > 0 &&
        !this.hasMore() &&
        cache.size >= pages
      );

    });


  // ==========================================================
  // ALL CACHED PRODUCTS
  // ==========================================================

  readonly allCachedProducts =
    computed(() => {

      const cache =
        this.pageCache();

      const allProducts: Product[] = [];

      const pages =
        Array.from(cache.keys())
          .sort((a, b) => a - b);

      for (const page of pages) {

        allProducts.push(
          ...(cache.get(page) ?? [])
        );

      }

      return allProducts;

    });


  // ==========================================================
  // CATEGORY FILTER
  // ==========================================================

  readonly selectedCategory =
    signal('');


  // ==========================================================
  // LOCAL FILTERS
  // ==========================================================

  readonly hasLocalFilters =
    computed(() =>
      !!this.selectedCategory()
    );


  // ==========================================================
  // CATEGORY OPTIONS
  // ==========================================================

  readonly categoryOptions =
    computed(() => {

      const categories =
        new Set<string>();

      for (
        const product of
        this.allCachedProducts()
      ) {

        const categoryName =
          product.category?.nameEn
            ?.trim();

        if (categoryName) {

          categories.add(
            categoryName
          );

        }

      }

      return Array.from(categories)
        .sort((a, b) =>
          a.localeCompare(b)
        );

    });


  // ==========================================================
  // MATERIAL PAGINATION
  // ==========================================================

  readonly pageIndex =
    signal(0);

  readonly pageSize =
    signal(10);


  // ==========================================================
  // SEARCH MODE
  // ==========================================================

  readonly isSearchMode =
    computed(() =>
      this.searchTerm()
        .trim()
        .length > 0
    );


  // ==========================================================
  // LOCAL FILTERING
  // ==========================================================

  readonly isLocalFiltering =
    computed(() =>
      this.hasLocalFilters() ||
      (
        this.isSearchMode() &&
        this.allProductsLoaded()
      )
    );


  // ==========================================================
  // FILTERED PRODUCTS
  // ==========================================================

  readonly filteredProducts =
    computed(() => {

      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const category =
        this.selectedCategory()
          .trim()
          .toLowerCase();


      return this.products()
        .filter(product => {


          // ================================================
          // SEARCH
          // ================================================

          let matchesSearch = true;

          if (term) {

            const nameEn =
              product.nameEn
                ?.toLowerCase()
                .includes(term);

            const nameAr =
              product.nameAr
                ?.toLowerCase()
                .includes(term);

            const descriptionEn =
              product.descriptionEn
                ?.toLowerCase()
                .includes(term);

            const descriptionAr =
              product.descriptionAr
                ?.toLowerCase()
                .includes(term);

            const categoryName =
              product.category?.nameEn
                ?.toLowerCase()
                .includes(term);


            matchesSearch =
              !!(
                nameEn ||
                nameAr ||
                descriptionEn ||
                descriptionAr ||
                categoryName
              );

          }


          // ================================================
          // CATEGORY
          // ================================================

          let matchesCategory = true;

          if (category) {

            matchesCategory =
              product.category?.nameEn
                ?.trim()
                .toLowerCase() ===
              category;

          }


          return (
            matchesSearch &&
            matchesCategory
          );

        });

    });


  // ==========================================================
  // LOCAL PAGINATION
  // ==========================================================

  readonly paginatedProducts =
    computed(() => {

      const filtered =
        this.filteredProducts();

      const start =
        this.pageIndex() *
        this.pageSize();

      return filtered.slice(
        start,
        start + this.pageSize()
      );

    });


  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  readonly displayedColumns = [

    'image',

    'nameEn',

    'nameAr',

    'category',

    'price',

    'sellingPrice',

    'discount',

    'stock',

    'variants',

    'actions'

  ];


  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    this.loadApiPage(1);

  }


  // ==========================================================
  // LOAD API PAGE
  // ==========================================================

  private loadApiPage(
    apiPage: number,
    append = false,
    afterLoad?: () => void
  ): void {

    if (apiPage < 1) {
      return;
    }


    if (this.isLoading()) {
      return;
    }


    if (
      this.totalPages() > 0 &&
      apiPage > this.totalPages()
    ) {

      this.hasMore.set(false);

      return;

    }


    // ========================================================
    // CACHE
    // ========================================================

    const cached =
      this.pageCache()
        .get(apiPage);

    if (cached) {

      if (append) {

        this.products.set([
          ...this.products(),
          ...cached
        ]);

      } else {

        this.products.set(cached);

      }


      this.currentApiPage.set(
        apiPage
      );

      afterLoad?.();

      return;

    }


    // ========================================================
    // LOADING
    // ========================================================

    this.isLoading.set(true);

    this.errorMessage.set(null);


    // ========================================================
    // API
    // ========================================================

    this.productService
      .getProducts(apiPage)
      .subscribe({

        next: (
          response: PagedResponse<Product>
        ) => {

          const items =
            Array.isArray(response?.items)
              ? response.items
              : [];


          // ================================================
          // CACHE
          // ================================================

          this.updatePageCache(
            apiPage,
            items
          );


          // ================================================
          // PRODUCTS
          // ================================================

          if (append) {

            this.products.set([
              ...this.products(),
              ...items
            ]);

          } else {

            this.products.set(items);

          }


          this.currentApiPage.set(
            apiPage
          );


          // ================================================
          // SERVER PAGINATION
          // ================================================

          this.totalCount.set(
            Number(response?.totalCount) || 0
          );

          this.totalPages.set(
            Number(response?.totalPages) || 0
          );

          this.hasMore.set(
            !!response?.hasMore
          );


          this.isLoading.set(false);

          afterLoad?.();

        },


        error: error => {

          console.error(
            'Error loading products:',
            error
          );

          this.errorMessage.set(
            'Failed to load products.'
          );

          this.isLoading.set(false);

        }

      });

  }


  // ==========================================================
  // LOAD NEXT PAGE
  // ==========================================================

  loadNextPage(): void {

    if (this.isLoading()) {
      return;
    }

    if (!this.hasMore()) {
      return;
    }


    const nextPage =
      this.currentApiPage() + 1;


    if (
      this.totalPages() > 0 &&
      nextPage > this.totalPages()
    ) {

      this.hasMore.set(false);

      return;

    }


    this.loadApiPage(
      nextPage,
      true
    );

  }


  // ==========================================================
  // CACHE
  // ==========================================================

  private updatePageCache(
    page: number,
    products: Product[]
  ): void {

    const newCache =
      new Map(this.pageCache());

    newCache.set(
      page,
      products
    );

    this.pageCache.set(
      newCache
    );

  }


  // ==========================================================
  // LOAD ALL PRODUCTS
  // ==========================================================

  private loadAllProducts(
    afterLoad?: () => void
  ): void {

    if (this.allProductsLoaded()) {

      this.setAllProducts();

      afterLoad?.();

      return;

    }


    const nextPage =
      this.getNextMissingPage();


    if (!nextPage) {

      this.setAllProducts();

      afterLoad?.();

      return;

    }


    this.isLoading.set(true);

    this.errorMessage.set(null);


    this.productService
      .getProducts(nextPage)
      .subscribe({

        next: (
          response: PagedResponse<Product>
        ) => {

          const items =
            Array.isArray(response?.items)
              ? response.items
              : [];


          this.updatePageCache(
            nextPage,
            items
          );


          this.totalCount.set(
            Number(response?.totalCount) ||
            this.totalCount()
          );

          this.totalPages.set(
            Number(response?.totalPages) ||
            this.totalPages()
          );

          this.hasMore.set(
            !!response?.hasMore
          );


          if (response?.hasMore) {

            this.loadAllProducts(
              afterLoad
            );

            return;

          }


          this.setAllProducts();

          this.isLoading.set(false);

          afterLoad?.();

        },


        error: error => {

          console.error(
            'Error loading all products:',
            error
          );

          this.errorMessage.set(
            'Failed to load products.'
          );

          this.isLoading.set(false);

        }

      });

  }


  // ==========================================================
  // NEXT MISSING PAGE
  // ==========================================================

  private getNextMissingPage(): number | null {

    const totalPages =
      this.totalPages();

    if (totalPages <= 0) {
      return null;
    }


    const cache =
      this.pageCache();


    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {

      if (!cache.has(page)) {
        return page;
      }

    }


    return null;

  }


  // ==========================================================
  // SET ALL PRODUCTS
  // ==========================================================

  private setAllProducts(): void {

    const allProducts: Product[] = [];

    const cache =
      this.pageCache();

    const pages =
      Array.from(cache.keys())
        .sort((a, b) => a - b);


    for (const page of pages) {

      allProducts.push(
        ...(cache.get(page) ?? [])
      );

    }


    this.products.set(
      allProducts
    );


    if (pages.length > 0) {

      this.currentApiPage.set(
        Math.max(...pages)
      );

    }

  }


  // ==========================================================
  // MATERIAL PAGINATOR
  // ==========================================================

  onPageChange(
    event: PageEvent
  ): void {

    this.pageIndex.set(
      event.pageIndex
    );

    this.pageSize.set(
      event.pageSize
    );

  }


  // ==========================================================
  // SEARCH
  // ==========================================================

  onSearch(
    value: string
  ): void {

    const term =
      value.trim();


    this.searchTerm.set(
      value
    );


    this.pageIndex.set(0);


    // ========================================================
    // EMPTY SEARCH
    // ========================================================

    if (!term) {

      if (this.hasLocalFilters()) {

        this.prepareLocalFiltering();

        return;

      }


      this.loadApiPage(1);

      return;

    }


    // ========================================================
    // LOCAL SEARCH
    // ========================================================

    if (this.allProductsLoaded()) {

      this.setAllProducts();

      return;

    }


    // ========================================================
    // API SEARCH
    // ========================================================

    this.searchProductsFromApi(
      term
    );

  }


  // ==========================================================
  // SEARCH API
  // ==========================================================

  private searchProductsFromApi(
    name: string
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set(null);


    this.productService
      .getProductsByName(name)
      .subscribe({

        next: products => {

          const results =
            Array.isArray(products)
              ? products
              : [];


          this.products.set(
            results
          );


          this.currentApiPage.set(1);

          this.totalCount.set(
            results.length
          );

          this.totalPages.set(
            results.length > 0
              ? 1
              : 0
          );

          this.hasMore.set(false);

          this.isLoading.set(false);

        },


        error: error => {

          console.error(
            'Error searching products:',
            error
          );


          this.products.set([]);

          this.totalCount.set(0);

          this.totalPages.set(0);

          this.hasMore.set(false);


          this.errorMessage.set(
            'Failed to search products.'
          );

          this.isLoading.set(false);

        }

      });

  }


  // ==========================================================
  // CATEGORY FILTER
  // ==========================================================

  onCategoryFilterChange(
    value: string
  ): void {

    this.selectedCategory.set(
      value?.trim() ?? ''
    );

    this.pageIndex.set(0);

    this.prepareLocalFiltering();

  }


  // ==========================================================
  // PREPARE FILTER
  // ==========================================================

  private prepareLocalFiltering(): void {

    if (!this.hasLocalFilters()) {

      if (this.isSearchMode()) {

        if (this.allProductsLoaded()) {

          this.setAllProducts();

        } else {

          this.searchProductsFromApi(
            this.searchTerm().trim()
          );

        }

        return;

      }


      this.loadApiPage(1);

      return;

    }


    // ========================================================
    // ALL PRODUCTS ALREADY LOADED
    // ========================================================

    if (this.allProductsLoaded()) {

      this.setAllProducts();

      return;

    }


    // ========================================================
    // LOAD EVERYTHING
    // ========================================================

    this.loadAllProducts();

  }


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  clearFilters(): void {

    this.selectedCategory.set('');

    this.pageIndex.set(0);


    if (this.isSearchMode()) {

      if (this.allProductsLoaded()) {

        this.setAllProducts();

      } else {

        this.searchProductsFromApi(
          this.searchTerm().trim()
        );

      }

      return;

    }


    this.loadApiPage(1);

  }


  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  clearSearch(): void {

    this.searchTerm.set('');

    this.pageIndex.set(0);


    if (this.hasLocalFilters()) {

      this.prepareLocalFiltering();

      return;

    }


    this.loadApiPage(1);

  }


  // ==========================================================
  // PRICE
  // ==========================================================

  getDiscountedPrice(
    product: Product
  ): number {

    const price =
      Number(product.price) || 0;

    const discount =
      Number(product.discountPercentage) || 0;


    return (
      price -
      (
        price *
        discount /
        100
      )
    );

  }


  // ==========================================================
  // PRIMARY IMAGE
  // ==========================================================

  getPrimaryImage(
    product: Product
  ): string | null {

    if (
      !product.images ||
      product.images.length === 0
    ) {

      return null;

    }


    const sortedImages =
      [...product.images]
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
        );
var image=environment.imageBaseUrl+ sortedImages[0]?.imageUrl

    return (
     image ??
      null
    );

  }


  // ==========================================================
  // IMAGE URL
  // ==========================================================

  getImageUrl(
    imageUrl?: string | null
  ): string {

    if (!imageUrl) {

      return (
        'assets/images/product-placeholder.png'
      );

    }


    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {

      return imageUrl;

    }


    return (
      `${environment.imageBaseUrl}${imageUrl}`
    );

  }


  // ==========================================================
  // ADD PRODUCT
  // ==========================================================

  addProduct(): void {

    this.openProductDialog(false);

  }


  // ==========================================================
  // EDIT PRODUCT
  // ==========================================================

  editProduct(
    product: Product
  ): void {

    this.openProductDialog(
      true,
      product
    );

  }


  // ==========================================================
  // PRODUCT DIALOG
  // ==========================================================

  private openProductDialog(
    isEditing: boolean,
    product?: Product
  ): void {

    this.dialog
      .open(
        AddProductComponent,
        {
          width: '900px',

          maxWidth: '95vw',

          maxHeight: '95vh',

          data: {
            isEditing,
            product
          }
        }
      )
      .afterClosed()
      .subscribe(result => {

        if (result) {

          this.refreshProducts();

        }

      });

  }


  // ==========================================================
  // REFRESH
  // ==========================================================

  private refreshProducts(): void {

    this.pageCache.set(
      new Map<number, Product[]>()
    );


    this.totalCount.set(0);

    this.totalPages.set(0);

    this.hasMore.set(false);

    this.currentApiPage.set(1);


    this.pageIndex.set(0);

    this.pageSize.set(10);


    this.searchTerm.set('');

    this.selectedCategory.set('');


    this.products.set([]);


    this.loadApiPage(1);

  }


  // ==========================================================
  // DELETE
  // ==========================================================

  deleteProduct(
    id: number
  ): void {

    this.dialog
      .open(
        ConfirmDeleteComponent,
        {
          data: this.translate.instant(
            'products.deleteConfirmation'
          )
        }
      )
      .afterClosed()
      .subscribe(result => {

        if (!result?.status) {
          return;
        }


        this.productService
          .deleteProduct(id)
          .subscribe({

            next: () => {

              this.refreshProducts();

            },


            error: error => {

              console.error(
                'Delete product error:',
                error
              );

              this.errorMessage.set(
                'Failed to delete product.'
              );

            }

          });

      });

  }

}