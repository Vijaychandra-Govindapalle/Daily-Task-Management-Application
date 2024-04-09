import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskviewComponent } from "./pages/taskview/taskview.component";
import { NewListComponent } from "./pages/new-list/new-list.component";
import { RouterModule } from '@angular/router';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { HttpClient } from '@angular/common/http';



@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, TaskviewComponent,NewListComponent,NewTaskComponent,RouterModule]
})

export class AppComponent {
  title = 'frontend';
  
}

