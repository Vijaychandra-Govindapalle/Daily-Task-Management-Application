import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  constructor(private authService: AuthService) {
    
  }

  onLoginButtonClicked(email: string, password: string) {
 this.authService.login(email, password).subscribe((res: HttpResponse<any>)=>{
     console.log(res)
 })
  }

}
