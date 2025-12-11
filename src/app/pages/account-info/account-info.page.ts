import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonInput,
  IonButton,
  IonIcon,
  IonToggle,
  IonButtons,
  IonFooter,
  IonToolbar,
  IonItem
} from '@ionic/angular/standalone';

import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.page.html',
  styleUrls: ['./account-info.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonIcon,
    IonItem,
    IonToggle,
    IonButtons,
    IonFooter,
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ]
})
export class AccountInfoPage implements OnInit {
  @ViewChild('nameInput', { static: false }) nameInput!: IonInput;

  userId: string = '';
  isEditing: boolean = false;
  showPassword: boolean = false;

  user = {
    name: '',
    email: '',
    password: '',
    active: true,
    unlock: false
  };

  constructor(
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error("Không tìm thấy ID user!");
      return;
    }

    this.userId = id;
    this.loadUser(id);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loadUser(id: string) {
    this.http.get<any>(`http://localhost:8080/users/${id}`).subscribe(data => {
      this.user = {
        name: data.username,
        email: data.emailAddress,
        password: data.password,
        active: data.status === 'active',
        unlock: data.status !== 'locked'
      };
    });
  }


  async delete() {
    const alert = await this.alertCtrl.create({
      header: 'Xóa tài khoản?',
      message: 'Bạn chắc chắn muốn xóa tài khoản này?',
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        {
          text: 'Xóa',
          role: 'confirm',
          handler: () => {
            this.http.delete(`http://localhost:8080/users/${this.userId}`)
              .subscribe(() => {
                console.log("Đã xóa");
                this.router.navigate(['/account']);
              });
          }
        }
      ]
    });

    await alert.present();
  }

  save() {
    const body = {
      username: this.user.name,
      emailAddress: this.user.email,
      password: this.user.password,
    };

    this.http.put(`http://localhost:8080/users/${this.userId}`, body)
      .subscribe(() => {
        console.log("Đã lưu thông tin");
        this.router.navigate(['/account']);
      });
  }

  close() {
    window.history.back();
  }

  async lockAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Khóa tài khoản?',
      message: 'Bạn chắc chắn muốn khóa tài khoản này?',
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        {
          text: 'Khóa',
          role: 'confirm',
          handler: () => {
            this.http.put(`http://localhost:8080/users/${this.userId}/lock`, {})
              .subscribe(() => {
                console.log("Đã khóa");
                this.user.active = false;
                this.user.unlock = false;
              });
          }
        }
      ]
    });

    await alert.present();
  }

  unlockAccount() {
    this.http.put(`http://localhost:8080/users/${this.userId}/unlock`, {})
      .subscribe(() => {
        this.user.active = true;
        this.user.unlock = true;
        console.log("Đã mở khóa");
      });
  }

  edit() {
    this.isEditing = true;
    setTimeout(() => {
      this.nameInput.setFocus();
    }, 300);
  }



}
