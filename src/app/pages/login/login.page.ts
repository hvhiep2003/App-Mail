import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
  ]
})
export class LoginPage {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = ''; // biến lưu thông báo lỗi
  showPassword: boolean = false;

  constructor(private router: Router, private http: HttpClient) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.errorMessage = ''; // reset lỗi mỗi lần login

    // 1. Kiểm tra input rỗng
    if (!this.username || !this.password) {
      this.errorMessage = "Cần nhập các trường bắt buộc nhập";
      return;
    }

    // 2. Gửi request login
    const payload = { email: this.username, password: this.password };
    this.http.post('http://localhost:8080/auth/login', payload)
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('user', JSON.stringify(res));
          localStorage.setItem('userEmail', this.username);
          this.router.navigate(['/mailbox']);
        },
        error: (err) => {
          this.errorMessage = "Email hoặc password chưa đúng";
        }
      });
  }
}

