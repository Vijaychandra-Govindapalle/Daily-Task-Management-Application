import { Component } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { List } from '../../models/list.model';

@Component({
  selector: 'app-new-list',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.css']
})
export class NewListComponent {
  selectedDate: Date | null = null;
  errormessage: string | null = null;
  errormessage1: string | null = null;
  message: string | null = null;
  selectedTime: any | null = null; // Assuming `Time` is an object with hours, minutes, and seconds properties

  constructor(private taskservice: TaskService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.taskservice.selectedDate$.subscribe(date => {
      this.selectedDate = date;
    });
    this.taskservice.selectedTime$.subscribe(time => {
      this.selectedTime = time;
    });
  }
  createNewList(title: string, date: Date) {
    if (this.selectedDate != null && title.trim() !== '') {
      if (this.selectedTime != null) {
        // Constructing a new Date object with selected time
        const timeDate = new Date(this.selectedDate);
        timeDate.setHours(this.selectedTime.hours);
        timeDate.setMinutes(this.selectedTime.minutes);
        timeDate.setSeconds(this.selectedTime.seconds);

        this.taskservice.fetchListsByDate(this.selectedDate).subscribe((lists: List[]) => {
          if (lists.length >= 9) {
            alert('You are busy for the day');
          } else {
            this.taskservice.Search(title, this.selectedDate!).subscribe((lists: List[]) => {
              if (lists.length > 0) {
                this.errormessage1 = 'List with the provided name already exists';
              } else {
                this.errormessage1 = '';
                this.taskservice.createList(title, this.selectedDate!, this.selectedTime).subscribe((response: any) => {
                  console.log(response);
                  this.message = 'List created successfully';
                });
              }
            });
          }
        });
      } else {
        alert('Please select the time');
      }
    } else {
      this.errormessage = 'Please select the date';
    }
  }

  goback() {
    this.router.navigate(['/']); // You can specify the route to which you want to navigate here
  }
}
