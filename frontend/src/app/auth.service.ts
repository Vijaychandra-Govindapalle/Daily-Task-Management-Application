import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { CanActivate, Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs';
import { callbackify } from 'util';


@Injectable({
  providedIn: 'root'
})


export class AuthService {


  constructor(private http: HttpClient, private webService: WebRequestService, private router: Router) { }

  isAuthenticated(): boolean {
    // Check if the user is authenticated based on your implementation
    // For example, you can check if the access token is present in localStorage
    const accessToken = localStorage.getItem('x-access-token');
    return !!accessToken; // Return true if accessToken exists, false otherwise
  }

  login(email: string, password: string) {
   return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will  be in the header of this response
        this.setSession(res.body.id, res.headers.get('x-access-token')!, res.headers.get('x-refresh-token')!);
        console.log("LOGGED IN!");
      }) 
    )
  }

  getAccessToken() {
    return localStorage.getItem('x-access-item')
  }

  getRefresToken() {
    return localStorage.getItem('x-refresh-token')
  }

  setAccessToken(accessToken: string) {
   localStorage.setItem('x-access-token', accessToken)
  }


  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('access-Token', accessToken);
    localStorage.setItem('refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('access-Token');
    localStorage.removeItem('refresh-token');
  }

  logout() {
    this.removeSession();

    this.router.navigate(['/Login'])
  }

      }
    
