import { Component } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { List } from '../../models/list.model';
import { TaskviewComponent } from '../taskview/taskview.component';

@Component({
  selector: 'app-edit-list',
  standalone: true,
  imports: [RouterModule, CommonModule,TaskviewComponent],
  templateUrl: './edit-list.component.html',
  styleUrl: './edit-list.component.css'
})
export class EditListComponent {

  selectedDate: Date | null = null;
  errormessage: string | null = null;
  errormessage1: string | null = null;
  message: string | null = null;
  startTime: Date | null = null;
  endTime: Date | null = null; 
  selectedList: string | null = null;

  constructor(private taskservice: TaskService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.taskservice.selectedDate$.subscribe(date => {
      this.selectedDate = date;
    });
    this.taskservice.selectedlist$.subscribe(selectedList=>{
      this.selectedList = selectedList
    })
    this.taskservice.selectedTime1$.subscribe(time =>{
      this.startTime = time;
    })
    this.taskservice.selectedTime2$.subscribe(time => {
      this.endTime = time
    })
  }
  editList(listtitle: string,date: Date){
    this.taskservice.editList(listtitle,this.selectedList!,date).subscribe((res:any)=>{
      this.router.navigate(['/lists'])
      console.log(res)
    })

  }
  

  goback() {
    this.router.navigate(['/']); // You can specify the route to which you want to navigate here
  }
}
