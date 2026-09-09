import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  SizeService
} from '../../../../services/size.service';

import {
  Size
} from '../../../../models/size.model';
import { SizeDialogComponent } from '../size-dialog.component/size-dialog.component';




@Component({
  selector: 'app-sizes',

  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],

  templateUrl: './sizes.component.html',

  styleUrl: './sizes.component.scss'
})
export class SizesComponent implements OnInit {

  private readonly sizeService =
    inject(SizeService);

  private readonly dialog =
    inject(MatDialog);


  // =========================================================
  // STATE
  // =========================================================

  sizes = signal<Size[]>([]);

  searchTerm = signal('');

  loading = signal(false);

  deletingId = signal<number | null>(null);


  // =========================================================
  // FILTERED SIZES
  // =========================================================

  filteredSizes = computed(() => {

    const term =
      this.searchTerm()
        .trim()
        .toLowerCase();


    if (!term) {

      return this.sizes();

    }


    return this.sizes()
      .filter(size =>
        size.name
          .toLowerCase()
          .includes(term)
      );

  });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadSizes();

  }


  // =========================================================
  // LOAD
  // =========================================================

  loadSizes(): void {

    this.loading.set(true);


    this.sizeService
      .getSizes()
      .subscribe({

        next: sizes => {

          this.sizes.set(sizes);

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Error loading sizes:',
            error
          );

          this.loading.set(false);

        }

      });

  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(value: string): void {

    this.searchTerm.set(value);

  }


  clearSearch(): void {

    this.searchTerm.set('');

  }


  // =========================================================
  // ADD
  // =========================================================

  openAddModal(): void {

    const dialogRef =
      this.dialog.open(
        SizeDialogComponent,
        {
          width: '500px',

          maxWidth: 'calc(100vw - 32px)',

          autoFocus: false,

          data: {
            size: null
          }
        }
      );


    dialogRef.afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }


        this.sizes.update(
          current => [
            ...current,
            result
          ]
        );

      });

  }


  // =========================================================
  // EDIT
  // =========================================================

  openEditModal(size: Size): void {

    const dialogRef =
      this.dialog.open(
        SizeDialogComponent,
        {
          width: '500px',

          maxWidth: 'calc(100vw - 32px)',

          autoFocus: false,

          data: {
            size
          }
        }
      );


    dialogRef.afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }


        this.sizes.update(
          current =>
            current.map(item =>
              item.id === result.id
                ? result
                : item
            )
        );

      });

  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteSize(size: Size): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete "${size.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.deletingId.set(
      size.id
    );


    this.sizeService
      .deleteSize(size.id)
      .subscribe({

        next: () => {

          this.sizes.update(
            current =>
              current.filter(
                item =>
                  item.id !== size.id
              )
          );


          this.deletingId.set(null);

        },

        error: error => {

          console.error(
            'Error deleting size:',
            error
          );


          this.deletingId.set(null);

        }

      });

  }

}