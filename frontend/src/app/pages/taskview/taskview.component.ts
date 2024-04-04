import { Component } from '@angular/core';
import { TaskService } from '../../task.service';
import { DateFilterFn, MatCalendar, MatCalendarCell, MatDatepickerInputEvent, MatDatepickerModule, MatMonthView } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import {  MatNativeDateModule } from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { NewListComponent } from '../new-list/new-list.component';
import { RouterModule } from '@angular/router'; 
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

@Component({
  selector: 'app-taskview',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatDatepicker,MatSlideToggleModule,MatInputModule,MatNativeDateModule,MatFormFieldModule,MatIconModule,NewListComponent,RouterModule,CommonModule,MatDatepickerModule, MatInputModule, NgxMaterialTimepickerModule],
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

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadHighlightedDates(); // Load highlighted dates from localStorage on component initialization

    // Retrieve the selected date from the service on component initialization
    this.taskService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
    });

    this.taskService.selectedlist$.subscribe(listTitle => {
      this.listTitle = listTitle!;
    });

    if (this.selectedDate !== null) {
      // If a date is selected, fetch the materials/tasks for that date
      this.fetchListsByDate(this.selectedDate);
    }
  }

  fetchListsByDate(date: Date): void {
    this.taskService.fetchListsByDate(date).subscribe({
      next: (lists: any) => {
        this.lists = lists;
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

  onDateSelected(event: MatDatepickerInputEvent<Date>): void {
    this.selectedDate = event.value!;
    this.taskService.selectedDate$.next(this.selectedDate);
    if (this.selectedDate !== null) {
      this.tasks = [];
      this.fetchListsByDate(this.selectedDate);
    } else {
      alert("Please select the date");
    }
  }

  onTimeSelected(event: Time) {
    this.selectedTime = event;
    this.taskService.selectedTime$.next(this.selectedTime);
    if (this.selectedTime !== null) {
      this.tasks = [];
    } else {
      alert('Please select the date')
    }

  }

  onListselected(listtitle: string): void {
    this.taskService.fetchtasks(listtitle, this.selectedDate!,this.selectedTime!).subscribe((tasks: Task[]) => {
      if (this.selectedListTitle === listtitle) {
        this.selectedListTitle = null; // Deselect if already selected
        this.tasks = [];
      } else {
        this.selectedListTitle = listtitle; // Select the clicked item
        this.taskService.selectedlist$.next(this.selectedListTitle);
        this.listTitle = listtitle;
        this.tasks = tasks; // Assign new tasks fetched for the selected list
      }
    });
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
  
}