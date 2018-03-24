import { Routes, RouterModule } from '@angular/router';
import { SharableComponent } from './sharable/sharable.component';
import { AppComponent } from './app.component';
import { ShowdataComponent } from './showdata.component';
import { LoginComponent } from './login.component';
import { AuthGuard } from './auth.gaurd';

const appRouting: Routes = [
  { path: 'publicEvent/:id', component: SharableComponent },
  { path: 'Login', component: LoginComponent },
  {
    path: '',
    redirectTo: '/Login',
    pathMatch: 'full'
  },
  { path: 'Home', component: ShowdataComponent, canActivate: [AuthGuard] },
  { path: '**', component: AppComponent }
];

export const routing = RouterModule.forRoot(appRouting);