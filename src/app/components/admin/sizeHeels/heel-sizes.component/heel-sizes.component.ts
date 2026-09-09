import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

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
  HeelSizeService
} from '../../../../services/heel-size.service';

import {
  HeelSize,
  CreateHeelSizeDto
} from '../../../../models/heel-size.model';

import {
  HeelSizeDialogComponent
} from '../heel-size-dialog.component/heel-size-dialog.component';


@Component({
  selector: 'app-heel-sizes',

  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],

  templateUrl: './heel-sizes.component.html',

  styleUrl: './heel-sizes.component.scss'
})
export class HeelSizesComponent implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly heelSizeService =
    inject(HeelSizeService);

  private readonly dialog =
    inject(MatDialog);


  // =========================================================
  // STATE
  // =========================================================

  readonly heelSizes =
    signal<HeelSize[]>([]);

  readonly searchTerm =
    signal('');

  readonly loading =
    signal(false);

  readonly deletingId =
    signal<number | null>(null);


  // =========================================================
  // FILTERED HEEL SIZES
  // =========================================================

  readonly filteredHeelSizes =
    computed(() => {

      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();


      if (!term) {

        return this.heelSizes();

      }


      return this.heelSizes()
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

    this.loadHeelSizes();

  }


  // =========================================================
  // LOAD
  // =========================================================

  loadHeelSizes(): void {

    this.loading.set(true);


    this.heelSizeService
      .getHeelSizes()
      .subscribe({

        next: sizes => {

          this.heelSizes.set(sizes);

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Error loading heel sizes:',
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
        HeelSizeDialogComponent,
        {
          width: '500px',

          maxWidth:
            'calc(100vw - 32px)',

          autoFocus: false,

          data: {
            heelSize: null
          }

        }
      );


    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {

          return;

        }


        const dto:
          CreateHeelSizeDto = {

          name: result.name

        };


        this.heelSizeService
          .createHeelSize(dto)
          .subscribe({

            next: createdHeelSize => {

              this.heelSizes.update(
                current => [
                  ...current,
                  createdHeelSize
                ]
              );

            },

            error: error => {

              console.error(
                'Error creating heel size:',
                error
              );

            }

          });

      });

  }


  // =========================================================
  // EDIT
  // =========================================================

  openEditModal(
    heelSize: HeelSize
  ): void {

    const dialogRef =
      this.dialog.open(
        HeelSizeDialogComponent,
        {
          width: '500px',

          maxWidth:
            'calc(100vw - 32px)',

          autoFocus: false,

          data: {
            heelSize
          }

        }
      );


    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {

          return;

        }


        const dto:
          CreateHeelSizeDto = {

          name: result.name

        };


        this.heelSizeService
          .updateHeelSize(
            heelSize.id,
            dto
          )
          .subscribe({

            next: () => {

              this.heelSizes.update(
                current =>
                  current.map(item =>
                    item.id === heelSize.id
                      ? {
                          ...item,
                          name: result.name
                        }
                      : item
                  )
              );

            },

            error: error => {

              console.error(
                'Error updating heel size:',
                error
              );

            }

          });

      });

  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteHeelSize(
    heelSize: HeelSize
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete "${heelSize.name}"?`
      );


    if (!confirmed) {

      return;

    }


    this.deletingId.set(
      heelSize.id
    );


    this.heelSizeService
      .deleteHeelSize(
        heelSize.id
      )
      .subscribe({

        next: () => {

          this.heelSizes.update(
            current =>
              current.filter(
                item =>
                  item.id !== heelSize.id
              )
          );


          this.deletingId.set(null);

        },

        error: error => {

          console.error(
            'Error deleting heel size:',
            error
          );


          this.deletingId.set(null);

        }

      });

  }

}