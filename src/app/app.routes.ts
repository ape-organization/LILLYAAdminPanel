import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/dashboard/admin-dashboard.component';
import { ProductManagementComponent } from './components/admin/product/product-management/product-management.component';
import { CategoryManagementComponent } from './components/admin/category/category-management/category-management.component';
import { UserManagementComponent } from './components/admin/user/user-management/user-management.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { BaseLayout } from './components/base-layout/base-layout';
import { Orders } from './components/orders/orders';
import { SliderManagementComponent } from './components/admin/slider/slider-management/slider-management.component';
import { SizesComponent } from './components/admin/size/sizes.component/sizes.component';
import { HeelSizesComponent } from './components/admin/sizeHeels/heel-sizes.component/heel-sizes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: BaseLayout,
    canActivate: [authGuard],
     data: { role: 'admin' }, 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
 { path: 'slider', component: SliderManagementComponent },
      { path: 'products', component: ProductManagementComponent },
      { path: 'categories', component: CategoryManagementComponent },
            { path: 'sizes', component: SizesComponent },

       { path: 'heelsizes', component: HeelSizesComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'orders', component: Orders }
    ]
  }
];
