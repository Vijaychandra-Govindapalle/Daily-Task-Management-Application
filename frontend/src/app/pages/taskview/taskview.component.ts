import { Component, ViewChild } from '@angular/core';
import { TaskService } from '../../task.service';
import { DateFilterFn, MatCalendar, MatCalendarCell, MatDatepickerInputEvent, MatDatepickerModule, MatMonthView } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import {  MatNativeDateModule } from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { NewListComponent } from '../new-list/new-list.component';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule, Time } from '@angular/common';
import { Task } from '../../models/task.model';
import { List } from '../../models/list.model';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ViewEncapsulation} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import {NgModule} from '@angular/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TimePickerComponent, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { enableRipple } from '@syncfusion/ej2-base';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { WebReqInterceptor } from '../../web-req.interceptor';
import { NotificationService } from '../../notification.service';
enableRipple(true);


@Component({
  selector: 'app-taskview',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  providers: [provideNativeDateAdapter(),{provide :HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true}],
  imports: [MatDatepicker,MatSlideToggleModule,MatInputModule,MatNativeDateModule,MatFormFieldModule,MatIconModule,NewListComponent,RouterModule,CommonModule,MatDatepickerModule, MatInputModule, NgxMaterialTimepickerModule, TimePickerModule,HttpClientModule],
  templateUrl: './taskview.component.html',
  styleUrl: './taskview.component.css'
})
export class TaskviewComponent {
  selectedDate: Date | null = null;
  selectedTime: Time | null = null;
  lists: any;
  tasks: Task[] | undefined;
  listTitle!: string;
  selectedListTitle: string | null = null;
  highlightedDates: { [key: string]: number[] } = {}; // Initialize as an empty object
  // Object to store highlighted dates for each month
    public month: number = new Date().getMonth();
    public fullYear: number = new Date().getFullYear();
    public date: number = new Date().getDate();
    public dateValue: Date = new Date(this.fullYear, this.month , this.date, 10, 0, 0);
    public minValue: Date = new Date(this.fullYear, this.month , this.date, 7, 0, 0);
    public minValue2: Date = new Date(this.fullYear, this.month , this.date, 7, 0, 0);
    public maxValue: Date = new Date(this.fullYear, this.month, this.date, 23, 0 ,0);
    public maxValue2: Date = new Date(this.fullYear, this.month, this.date, 23, 0 ,0);
    @ViewChild('timePicker1') timePicker1!: TimePickerComponent;
    @ViewChild('timePicker2') timePicker2!: TimePickerComponent;
    selectedTime1: Date | null = null;
    selectedTime2: Date | null = null;
    previousselectedTime: Date | null = null
    isTime1Selected: boolean = false;

  constructor(private taskService: TaskService,private router:Router,private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadHighlightedDates(); // Load highlighted dates from localStorage on component initialization
     // Fetch your lists and other initializations...
    this.checkUpcomingListStartTimes(); // Call it initially
  
  // Schedule periodic checks every 5 minutes (300,000 milliseconds)
  setInterval(() => {
    this.checkUpcomingListStartTimes();
  }, 60000); // Adjust the interval as needed

    // Retrieve the selected date from the service on component initialization
    this.taskService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
      this.month = date?.getMonth()!;
      this.fullYear = date?.getFullYear()!;
      this.date = date?.getDate()!;
     

    });

    this.taskService.selectedlist$.subscribe(listTitle => {
      this.listTitle = listTitle!;
    });
    this.onListselected(this.listTitle)

    // Retrieve the selected list title from local storage

    if (this.selectedDate !== null) {
      // If a date is selected, fetch the materials/tasks for that date
      this.fetchListsByDate(this.selectedDate);
    }
    
  }

  fetchListsByDate(date: Date): void {
    this.taskService.fetchListsByDate(date).subscribe({
      next: (lists: any) => {
        this.lists = lists;
        for (const list of this.lists) {
          const endTime = new Date(list.endTime);
          if (!this.previousselectedTime || endTime > this.previousselectedTime) {
            this.previousselectedTime =  endTime;
          }
        }
        if (this.previousselectedTime) {
          const selectedHour = this.previousselectedTime.getHours();
          const selectedMinute = this.previousselectedTime.getMinutes();
    
          // Set the minimum value for the first time picker to be  after the  latest end selected time 
          const minTime1 = new Date();
          minTime1.setHours(selectedHour);
          minTime1.setMinutes(selectedMinute);
    
          // Update the min value for the first time picker
          this.minValue = minTime1;
          this.minValue2 = minTime1
        }
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (this.lists && this.lists.length >= 9) {
          if (!this.highlightedDates[monthKey]) {
            this.highlightedDates[monthKey] = [];
          }
          this.highlightedDates[monthKey].push(date.getDate());
          this.updateHighlightedDates(); // Update highlightedDates array in localStorage
        }
        // Handle the fetched materials here as per your requirement
      },
      error: (error) => {
        console.error('Error fetching materials:', error);
      }
    });
  }

  checkUpcomingListStartTimes(): void {
    const currentTime = new Date().getTime();
    const notificationThreshold = 19 * 60 * 1000; // 5 minutes in milliseconds

    this.lists.forEach((list: { startTime: string | number | Date; title: any; }) => {
      const startTime = new Date(list.startTime).getTime();

      if (startTime - currentTime <= notificationThreshold && startTime > currentTime) {
        // Send notification for upcoming list start time
        this.notificationService.sendNotification(`Upcoming list: ${list.title}`, `Starts at ${list.startTime}`);
      }
    });
  }

  onDateSelected(event: MatDatepickerInputEvent<Date>): void {
    this.selectedTime1 = null;
    this.selectedDate = event.value!;
    this.taskService.selectedDate$.next(this.selectedDate);
    if (this.selectedDate !== null) {
      this.tasks = [];
      const emptytext = document.getElementById('empty-text')
      emptytext!.innerText = '';
      this.selectedListTitle = null
      this.fetchListsByDate(this.selectedDate);
    } else {
      alert("Please select the date");
    }
  }

  onTimeSelected1(event: any): void {
    // Update the min value for the first time picker based on the selected time in the previous time picker
    this.selectedTime1 = event.value;
    
    this.taskService.selectedTime1$.next(this.selectedTime1);
    if (this.selectedTime1) {
      const selectedHour = this.selectedTime1.getHours();
      const selectedMinute = this.selectedTime1.getMinutes();

      // Set the minimum value for the second time picker to be 30 minutes after the selected time in the first time picker
      const minTime2 = new Date();
      minTime2.setHours(selectedHour);
      minTime2.setMinutes(selectedMinute + 30);

      // Update the min value for the second time picker
      this.minValue2 = minTime2;
    }
  }


  onTimeSelected2(event: any): void {
    this.selectedTime2 = event.value;
    this.taskService.selectedTime2$.next(this.selectedTime2);
    // Handle time selection for the second time picker if needed
  }
  saveTaskTitle(tasktitle:string){
    this.taskService.selectedTask.next(tasktitle)
  }


  onListselected(listtitle: string): void {
    const emptytext = document.getElementById('empty-text')
    this.taskService.fetchtasks(listtitle, this.selectedDate!,this.selectedTime!).subscribe((tasks: Task[]) => {
      if(tasks.length == 0){
        emptytext!.innerText = 'There are no tasks here. Please click the add button to add.';
      }else{
        emptytext!.innerText = '';
      }
      if (this.selectedListTitle === listtitle) {
        this.selectedListTitle = null; // Deselect if already selected
        this.tasks = [];
        emptytext!.innerText = '';
        
      } else {
        this.selectedListTitle = listtitle; // Select the clicked item
        this.taskService.selectedlist$.next(this.selectedListTitle);
        this.listTitle = listtitle;
        this.tasks = tasks; // Assign new tasks fetched for the selected list
        this.fetchTasksForSelectedList();
      }
    });
  }

  fetchTasksForSelectedList(): void {
    if (this.selectedListTitle && this.selectedDate) {
      this.taskService.fetchtasks(this.selectedListTitle, this.selectedDate, this.selectedTime!).subscribe((tasks: Task[]) => {
        this.tasks = tasks;
      });
    }
  }

  handlekeypress(event: KeyboardEvent): void {
    let date = this.selectedDate!;
    const inputElement = event.target as HTMLInputElement;
    if (event.key == 'Enter') {
      if (inputElement != null) {
        const inputText = inputElement.value;
        this.processInput(inputText, date, this.selectedListTitle!);
      }
    }
  }

  processInput(text: string, selectedDate: Date, listTitle?: string): void {
    if (listTitle) {
      this.taskService.Search(text, selectedDate, listTitle).subscribe((tasks: Task[]) => {
        this.tasks = tasks;
      });
    } else {
      this.taskService.Search(text, selectedDate, listTitle).subscribe((lists: List) => {
        this.lists = lists;
      });
    }
  }

  onTaskClick(task: Task): void {
    this.taskService.completeTask(task, this.listTitle).subscribe(() => {
      console.log('Completed task successfully');
      task.completed = !task.completed;
    });
    // Set the task to completed
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Extract the year and month from the cellDate
    const year = cellDate.getFullYear();
    const month = cellDate.getMonth();

    // Construct the key for the highlightedDates object
    const monthKey = `${year}-${month}`;

    // Only highlight dates inside the month view
    if (view === 'month') {
      const date = cellDate.getDate();

      // Check if the current month has specific dates to highlight
      if (this.highlightedDates[monthKey] && this.highlightedDates[monthKey].includes(date)) {
        return 'example-custom-date-class';
      }
    }

    return '';
  };

  loadHighlightedDates(): void {
    if (typeof localStorage !== 'undefined') {
      const storedDates = localStorage.getItem('highlightedDates');
      if (storedDates) {
        this.highlightedDates = JSON.parse(storedDates);
      }
    }
  }
  
  updateHighlightedDates(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('highlightedDates', JSON.stringify(this.highlightedDates));
    }
  }

  onDeleteClickList() {
    this.taskService.deleteList(this.selectedListTitle!).subscribe((res: any) => {
      // Remove the deleted list from the local data
      this.lists = this.lists.filter((list: any) => list.title !== this.selectedListTitle);
      this.tasks = []
      // Optionally clear the selectedListTitle if needed
      this.selectedListTitle = null;
  
      // Optionally navigate to a different route
      this.router.navigate(['/lists']);
  
      console.log(res);
    });
  }
  
  onDeleteTaskClick(tasktitle:string) {
     this.taskService.deleteTask(tasktitle,this.selectedListTitle!).subscribe((res: any) => {
      this.tasks = this.tasks?.filter((task:any)=>task.title !== tasktitle);
      
      this.router.navigate(['/lists']);
  
      console.log(res);
     })
  }
  

}
