import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoStreamComponent } from './video-stream/video-stream.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginGuard } from './login/login.guard';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  // { path: 'video-stream', component: VideoStreamComponent },
  { path: 'login', component: LoginComponent, canActivate:[LoginGuard]},
  {path: 'register', component: RegisterComponent, canActivate:[LoginGuard]},
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'home', component: DashboardComponent, children: [
    {path: 'video-stream', component:VideoStreamComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
