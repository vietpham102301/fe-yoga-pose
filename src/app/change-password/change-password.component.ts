import { Component } from '@angular/core';
import { ChangePasswordService } from './change-password-service/change-password.service';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  errorMessage: string = '';

  constructor(private changePasswordService: ChangePasswordService) {}

  changePassword() {
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    const requestBody = {
      "old_password": this.currentPassword,
      "new_password": this.newPassword
    }
    let userId = localStorage.getItem('userId') || ''
    console.log(userId);
    
    this.changePasswordService.updatePassword(userId, requestBody).subscribe({
      next: (result) => {
        this.errorMessage = '';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        console.log(result);
        alert('Password changed successfully');
      },
      error: (error) => {
        this.errorMessage = error.error.message;
      }
    });
  }
}
