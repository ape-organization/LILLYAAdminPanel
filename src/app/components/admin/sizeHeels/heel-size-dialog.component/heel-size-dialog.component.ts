import {
  Component,
  Inject,
  signal
} from '@angular/core';

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


export interface HeelSizeDialogData {
  id?: number;
  name?: string;
}


@Component({
  selector: 'app-heel-size-dialog',
  standalone: true,

  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],

  templateUrl: './heel-size-dialog.component.html',
  styleUrl: './heel-size-dialog.component.scss'
})
export class HeelSizeDialogComponent {

  readonly name = signal('');

  readonly saving = signal(false);

  readonly isEdit = signal(false);


  constructor(
    private readonly dialogRef:
      MatDialogRef<HeelSizeDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public readonly data: HeelSizeDialogData
  ) {

    if (data?.id) {

      this.isEdit.set(true);

    }

    this.name.set(data?.name ?? '');

  }


  save(): void {

    const value = this.name().trim();

    if (!value || this.saving()) {
      return;
    }

    this.saving.set(true);

    this.dialogRef.close({
      id: this.data?.id,
      name: value
    });

  }


  cancel(): void {

    if (this.saving()) {
      return;
    }

    this.dialogRef.close();

  }


  onNameInput(value: string): void {

    this.name.set(value);

  }

}