import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { CanActivate, Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs';




@Injectable({
  providedIn: 'root'
})


export class AuthService {


  constructor(private http: HttpClient, private webService: WebRequestService, private router: Router) { }

  

  login(email: string, password: string) {
   return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will  be in the header of this response
        this.setSession(res.body._id, res.headers.get('x-access-token')!, res.headers.get('x-refresh-token')!);
        console.log("LOGGED IN!");
      }) 
    )
  }

  
  signup(email: string, password: string) {
    return this.webService.signup(email, password).pipe(
       shareReplay(),
       tap((res: HttpResponse<any>) => {
         // the auth tokens will  be in the header of this response
         this.setSession(res.body._id, res.headers.get('x-access-token')!, res.headers.get('x-refresh-token')!);
         console.log("Successfully Signed Up!");
       }) 
     )
   }
 
  getAccessToken() {
    return localStorage.getItem('x-access-token')
  }

  getRefresToken() {
    return localStorage.getItem('x-refresh-token')
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  }


  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  isAuthenticated(): boolean {
    // Check if the user is authenticated based on your implementation
    // For example, you can check if the access token is present in localStorage
    const accessToken =  localStorage.getItem('x-access-token');
    return !!accessToken; // Return true if accessToken exists, false otherwise
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getUserId() {
    return localStorage.getItem('user-id')
  }

  getNewAccessToken() {
    const refreshToken = this.getRefresToken();
    const userId = this.getUserId();
  
    // Check if refreshToken or userId is null
    if (!refreshToken || !userId) {
      // Handle the case where refreshToken or userId is null
      return;
    }
  
    return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': refreshToken,
        '_id': userId
      },
      observe: 'response'
    }).pipe(
      tap(response => {
        const accessToken = response.headers.get('x-access-token');
        if (accessToken) {
          this.setAccessToken(accessToken);
        }
      })
    );
  }

  logout() {
    this.removeSession();

    this.router.navigate(['/Login'])
  }

      }
    
