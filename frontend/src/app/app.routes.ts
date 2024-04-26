import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { TaskviewComponent } from './pages/taskview/taskview.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { RouterModule } from '@angular/router';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { inject } from '@angular/core';
import { AuthGuard } from './auth.guard';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
    {
        path :'', redirectTo: 'lists',pathMatch: "full",
    },
    {
        path :'new-list',
        component : NewListComponent
    },
    {
        path:'new-task',
        component : NewTaskComponent

    },
    {
        path :'lists',
        component : TaskviewComponent,
        canActivate: [AuthGuard]
    },
    {
        path :'Login',
        component : LoginPageComponent
    },
    {
        path :'signup',
        component : SignupComponent
    }


];
