import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FilesComponent } from './files/files.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'files/:folder', component: FilesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
