import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonInput, IonButton, IonIcon, NavController
} from '@ionic/angular/standalone';
import { IonFooter } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { IonText } from '@ionic/angular/standalone';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonInput, IonButton, IonIcon,
    CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule, IonFooter, IonText
  ]
})
export class AddUserPage implements OnInit {

  form!: FormGroup;
  showPassword = false;
  showConfirm = false;
  emailUsed = false;
  passwordMismatch = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]],
      confirm: ['', Validators.required]
    });
  }

  toggleShow(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirm = !this.showConfirm;
    }
  }


  submit() {
    // reset trạng thái lỗi
    this.emailUsed = false;
    this.passwordMismatch = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // kiểm tra confirm password
    if (this.form.value.password !== this.form.value.confirm) {
      this.passwordMismatch = true;
      return;
    }

    const payload = {
      username: this.form.value.username,
      emailAddress: this.form.value.email,
      password: this.form.value.password
    };

    this.http.post("http://localhost:8080/users", payload).subscribe({
      next: res => {
        console.log("Created:", res);
        this.navCtrl.back();
      },
      error: err => {
        if (err.status === 409) { // giả sử 409 = email đã được dùng
          this.emailUsed = true;
        } else {
          console.log("Error:", err);
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/account']);
  }
}
