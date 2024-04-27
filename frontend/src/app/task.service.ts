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
  selectedTime1$: BehaviorSubject<Date| null> = new BehaviorSubject<Date| null>(null);
  selectedTime2$: BehaviorSubject<Date| null> = new BehaviorSubject<Date| null>(null);
  selectedTask: BehaviorSubject<string|null> = new BehaviorSubject<string|null>(null)


  constructor(private webReqService: WebRequestService) { }

  createList(title: string, selectedDate: Date, startingTime: Date, endingTime: Date) {
    const payload = {
      title: title,
      date: selectedDate.toISOString(),
      startTime: startingTime.toISOString(),
      endTime: endingTime.toISOString()
    };
    return this.webReqService.post(`lists`, payload);
  }
  createTask(title: string, listTitle: string, selectedDate: Date) {
    const payload = {
      tasktitle: title,
      listtitle: listTitle,
      date: selectedDate.toISOString()
    };
    return this.webReqService.post(`lists`, payload);
  }
  fetchListsByDate(selectedDate: Date): Observable<any> {
    return this.webReqService.get(`lists`,selectedDate);
  }
  /*fetchlistsByTime(selectedTime: Time,selectedDate: Date): Observable<any> {
    return this.webReqService.get(`lists`,selectedDate);
  }*/
  fetchtasks(listtitle: string,selectedDate:Date,selectedTime: Time){
    return this.webReqService.get(`lists`,selectedDate,undefined,undefined,listtitle)
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
  
    return this.webReqService.patch(`lists`, payload);
  }

  deleteList(listtitle: string){
   return  this.webReqService.delete(`lists`,listtitle,undefined)
  }
  
  editList(listtitle: string,selectedList:string,date: Date){
    const payload = {
      listtitle:selectedList,
      date:date,
      title:listtitle
    }
   return this.webReqService.patch(`lists`,payload)
  }
  editTask(tasktitle: string,selectedTask:string,selectedList:string,date: Date){
    const payload = {
      title: tasktitle,
      selectedTask: selectedTask,
      date:date,
      listtitle:selectedList
    }
   return this.webReqService.patch(`lists`,payload)
  }

  deleteTask(tasktitle:string, listtitle:string){
    return this.webReqService.delete(`lists`,listtitle,tasktitle)
  }
}
