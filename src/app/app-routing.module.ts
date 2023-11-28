import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoStreamComponent } from './video-stream/video-stream.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginGuard } from './login/login.guard';
import { RegisterComponent } from './register/register.component';
import { HistoryComponent } from './history/history.component';
import { SavedComponent } from './saved/saved.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'home', component: DashboardComponent, canActivate:[AuthGuard],children: [
      { path: 'video-stream', component: VideoStreamComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'saved', component: SavedComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
