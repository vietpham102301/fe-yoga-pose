import { Component } from '@angular/core';
import { ForgotPasswordService } from './forgot-password-service/forgot-password.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';

  constructor(private forgotPasswordService: ForgotPasswordService) { }

  forgotPassword() {
    const requestBody = {
      "email_or_username": this.email
    }
    this.forgotPasswordService.resetPassword(requestBody).subscribe({
      next: (_) => {
        this.errorMessage = '';
        this.email = '';
        alert('Password reset link sent to your email');
      },
      error: (error) => {
        this.errorMessage = error.error.message;
      }
    })
    console.log('Forgot Password clicked');
  }
}
