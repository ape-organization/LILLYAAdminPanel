import {
  Component,
  Inject,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
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


export interface SizeDialogData {
  size?: Size | null;
}


@Component({
  selector: 'app-size-dialog',

  standalone: true,

  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],

  templateUrl: './size-dialog.component.html',

  styleUrl: './size-dialog.component.scss'
})
export class SizeDialogComponent {

  private readonly sizeService = inject(SizeService);

  private readonly dialogRef =
    inject(MatDialogRef<SizeDialogComponent>);


  // =========================================================
  // STATE
  // =========================================================

  sizeName = signal('');

  saving = signal(false);


  // =========================================================
  // EDITING
  // =========================================================

  readonly editingSize: Size | null;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: SizeDialogData
  ) {

    this.editingSize = data?.size ?? null;

    if (this.editingSize) {

      this.sizeName.set(
        this.editingSize.name
      );

    }

  }


  // =========================================================
  // CLOSE
  // =========================================================

  close(): void {

    if (this.saving()) {
      return;
    }

    this.dialogRef.close();

  }


  // =========================================================
  // SAVE
  // =========================================================

  saveSize(): void {

    const name =
      this.sizeName()
        .trim();


    if (!name) {
      return;
    }


    this.saving.set(true);


    // =======================================================
    // UPDATE
    // =======================================================

    if (this.editingSize) {

      this.sizeService
        .updateSize(
          this.editingSize.id,
          {
            name
          }
        )
        .subscribe({

          next: updatedSize => {

            this.saving.set(false);

            this.dialogRef.close(
              updatedSize
            );

          },

          error: error => {

            console.error(
              'Error updating size:',
              error
            );

            this.saving.set(false);

          }

        });

      return;
    }


    // =======================================================
    // CREATE
    // =======================================================

    this.sizeService
      .createSize({
        name
      })
      .subscribe({

        next: createdSize => {

          this.saving.set(false);

          this.dialogRef.close(
            createdSize
          );

        },

        error: error => {

          console.error(
            'Error creating size:',
            error
          );

          this.saving.set(false);

        }

      });

  }

}