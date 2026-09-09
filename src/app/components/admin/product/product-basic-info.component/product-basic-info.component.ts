import {
  CommonModule
} from '@angular/common';

import {
  Component,
  Input
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  TranslatePipe
} from '@ngx-translate/core';
import { Category } from '../../../../models/category.model';




@Component({
  selector: 'app-product-basic-info',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslatePipe
  ],

  templateUrl:
    './product-basic-info.component.html',

  styleUrl:
    './product-basic-info.component.scss'
})
export class ProductBasicInfoComponent {

  @Input({
    required: true
  })
  form!: FormGroup;


  @Input({
    required: true
  })
  categories: Category[] = [];


  @Input()
  isLoadingCategories = false;

}