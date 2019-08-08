import { MapComponent } from './map/map.component';
import { AuthGuard } from './auth/auth.guard';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  { path: '', component: MapComponent, canActivate: [AuthGuard]},
  { path: 'posts', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: PostCreateComponent, canActivate: [ AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [ AuthGuard] },
  { path: 'auth', loadChildren: './auth/auth.module#AuthModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
