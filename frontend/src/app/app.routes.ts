import { Routes } from '@angular/router';
import { TaskviewComponent } from './pages/taskview/taskview.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { RouterModule } from '@angular/router';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
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
        component : TaskviewComponent
    },
    {
        path :'lists',
        component : TaskviewComponent
    },
    {
        path :'Login',
        component : LoginPageComponent
    }


];
