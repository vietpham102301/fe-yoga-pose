import { Component } from '@angular/core';
import { RegisterService } from './register-service/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;
  errorMessage = '';
  constructor(private registerService: RegisterService, private router: Router) { }

  register() {
    const registerBody = {
      username: this.username,
      email: this.email,
      password: this.password
    };
    this.registerService.register(registerBody).subscribe(
      {
        next: (result) => {
          console.log(result);
          if (result) {
            if(result.status === 400){
                this.errorMessage = result.error.error;
                this.router.navigate(["/register"]);
            }
            this.router.navigate(["/login"]);
            
          } else {
              this.router.navigate(["/login"]);
          }
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }
}
