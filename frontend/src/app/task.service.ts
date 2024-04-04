import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Task } from './models/task.model';
import { Time } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  selectedDate$: BehaviorSubject<Date | null> = new BehaviorSubject<Date | null>(null);
  selectedlist$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selectedTime$: BehaviorSubject<Time| null> = new BehaviorSubject<Time | null>(null);

  constructor(private webReqService: WebRequestService) { }

  createList(title: string, selectedDate: Date, selectedTime: Time) {
    const timeString = `${selectedTime.hours}:${selectedTime.minutes}`;
    const payload = {
      title: title,
      date: selectedDate.toISOString(),
      Time: timeString
    };
    return this.webReqService.post('lists', payload);
  }
  createTask(title: string, listTitle: string, selectedDate: Date) {
    const payload = {
      tasktitle: title,
      listtitle: listTitle,
      date: selectedDate.toISOString()
    };
    return this.webReqService.post('lists', payload);
  }
  fetchListsByDate(selectedDate: Date): Observable<any> {
    return this.webReqService.get(`lists`,selectedDate);
  }
  fetchlistsByTime(selectedTime: Time,selectedDate: Date): Observable<any> {
    return this.webReqService.get(`lists`,selectedDate);
  }
  fetchtasks(listtitle: string,selectedDate:Date,selectedTime: Time){
    return this.webReqService.get(`lists`,selectedDate,selectedTime,undefined,listtitle)
  }
  Search(text: string,date: Date,listtitle?:string){
    return this.webReqService.get(`lists`,date,undefined,text,listtitle)
  }
  completeTask(task: Task, listTitle?: string) {
    const payload = {
      taskTitle: task.title,
      listTitle: listTitle,
      completed: !task.completed
    };
  
    return this.webReqService.patch('lists', payload);
  }

}
