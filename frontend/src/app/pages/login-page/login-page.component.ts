import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  constructor(private authService: AuthService,private router:Router) {
    
  }

  onLoginButtonClicked(email: string, password: string) {
 this.authService.login(email, password).subscribe((res: HttpResponse<any>)=>{
  if(res.status === 200){
    //we have logged in successfully
    this.router.navigate(['/lists'])
  }
     console.log(res)
 })
  }

}
