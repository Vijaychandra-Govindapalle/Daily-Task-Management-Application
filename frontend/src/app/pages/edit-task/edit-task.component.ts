import { Component } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskviewComponent } from '../taskview/taskview.component';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule,TaskviewComponent],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.css'
})
export class EditTaskComponent {

  selectedDate: Date | null = null;
  errormessage: string|null = null;
  errormessage1: string|null = null;
  listTitle: string | null = null;
  message: string | null = null;
  selectedTask: string|null = null
  constructor(private taskservice: TaskService,private route: ActivatedRoute, private router: Router) {
    
  }
  ngOnInit(): void {
    this.taskservice.selectedDate$.subscribe(date  => {
      this.selectedDate = date;
    });
    this.taskservice.selectedlist$.subscribe(listTitle=>{
      this.listTitle = listTitle
    })
    this.taskservice.selectedTask.subscribe(tasktitle =>{
      this.selectedTask = tasktitle
    })
  }

  EditTask(tasktitle:string) {
    this.taskservice.editTask(tasktitle,this.selectedTask!,this.listTitle!,this.selectedDate!).subscribe((res:any)=>{
      this.router.navigate(['/lists'])
      console.log(res)
    })
    }


   goback(){
    this.router.navigateByUrl('/lists'); // You can specify the route to which you want to navigate here
  }

}
