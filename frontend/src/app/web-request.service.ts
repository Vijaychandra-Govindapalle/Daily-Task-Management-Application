import { Time } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL;
  constructor(private http: HttpClient) { 
   this.ROOT_URL = 'http://localhost:3000'
  }
  get(uri: string, date?: Date, Time?: Time,title?: string,listtitle?:string): Observable<any> {
    let params = new HttpParams();
    if(date){
    params = params.set('date', date.toISOString());
    }
    /*if(Time){
      const time = `${Time.hours}:${Time.minutes}`;
        params = params.set('Time', time);
    }*/
    if (title) {
      params = params.set('title',title);
    }
    if (listtitle) {
      params = params.set('listtitle',listtitle);
    }
    
  
    return this.http.get(`${this.ROOT_URL}/${uri}`, { params: params });
  }

  post(uri: string, payload: any) {
    return this.http.post(`${this.ROOT_URL}/${uri}`, payload);
  }
  
  
  

  patch(uri: String, payload: any){
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload);
  }

  delete(uri: string,listtitle:string,tasktitle?:string){
    let params = new HttpParams();
   
    params = params.set('listtitle',listtitle);
    if(tasktitle){
    params = params.set('tasktitle',tasktitle)
    }
    
   
    
    
    return this.http.delete(`${this.ROOT_URL}/${uri}`, { params: params });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email,
      password
    },
    {
      observe: 'response'
    })
  }
  signup(email: string, password: string) {
    return this.http.post(`${this.ROOT_URL}/users`, {
      email,
      password
    },
    {
      observe: 'response'
    })
  }
}
