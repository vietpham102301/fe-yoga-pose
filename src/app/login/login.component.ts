import { Component } from '@angular/core';
import {AuthService} from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username!: string;
  password!: string;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {

  }
  login() {
    console.log("login")
    this.authService.Authenticate(this.username, this.password).subscribe(
      {
        next: (result) => {
          console.log("1")
          console.log(result);
          if (result) {
            if(result.status === 401){
              this.errorMessage = result.error.error;
              this.router.navigate(["/login"]);
              return
            }

            if(result.status === 400){
                this.errorMessage = result.error.error;
                this.router.navigate(["/login"]);
                return
            }
            this.router.navigate(["/home"]);
            
          } else {
              this.router.navigate(["/home"]);
          }
        },
        error: (error) => {
          console.log("2")
          console.log(error);
        }
      }
    );
  }
}
