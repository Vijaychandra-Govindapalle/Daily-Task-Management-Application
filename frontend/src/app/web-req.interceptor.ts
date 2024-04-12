import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { error } from 'console';


@Injectable({
  providedIn: 'root',
  
})

export class WebReqInterceptor implements HttpInterceptor {

  constructor( private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Handle the request
    request = this.addAuthHeader(request);

    //call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
       console.log(error);
        if(error.status === 401){
          // 401 error so we are unauthorized

          // refresh the access token 
          console.log("test")
          this.authService.logout();
        }



        return throwError(()=>error)
      })
    )    
  }

  addAuthHeader(request: HttpRequest<any>) {
    //get the access token
   const token = this.authService.getAccessToken();

   if (token) {
    return request.clone({
      setHeaders: {
        'x-access-token': token
      }
    })
   }
    // append the access token to the request header
    return request;
  }

}
