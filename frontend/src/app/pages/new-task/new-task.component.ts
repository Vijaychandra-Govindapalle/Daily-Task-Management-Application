import { Component, ViewChild, inject } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, Time } from '@angular/common';
import { Router } from '@angular/router';
import { TaskviewComponent } from '../taskview/taskview.component';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [CommonModule,TaskviewComponent],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css'
})
export class NewTaskComponent {
  selectedDate: Date | null = null;
  errormessage: string|null = null;
  errormessage1: string|null = null;
  listTitle: string | null = null;
  message: string | null = null;
  constructor(private taskservice: TaskService,private route: ActivatedRoute, private router: Router) {
    
  }
  ngOnInit(): void {
    this.taskservice.selectedDate$.subscribe(date  => {
      this.selectedDate = date;
    });
    this.taskservice.selectedlist$.subscribe(listTitle=>{
      this.listTitle = listTitle
    })
  }
  
  
  createnewTask(title: string){
    if(this.selectedDate!=null&&title.trim() !== ''&&this.listTitle!=null){
      this.taskservice.Search(title,this.selectedDate!,this.listTitle).subscribe((tasks:any)=>{
      if(tasks.length > 0){
        this.errormessage1 = 'task with the provided name already exists'
       }
      else{
        this.taskservice.createTask(title,this.listTitle!,this.selectedDate!).subscribe((response: any)=>{
          console.log(response);
          this.message = 'Task created successfully'
          // Store the selected list title in local storage before navigating back
          this.router.navigateByUrl('/lists');
          
          
        
      })
    }
     })
    }
    else {
      this.errormessage = "Please go back and select a list"
    }
  }
  
   
  goback(){
    this.router.navigateByUrl('/lists'); // You can specify the route to which you want to navigate here
  }
}
