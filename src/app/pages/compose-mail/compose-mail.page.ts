import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, ModalController } from '@ionic/angular';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ScheduleMailModalComponent } from './schedule-mail-modal.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-compose-mail',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './compose-mail.page.html',
  styleUrls: ['./compose-mail.page.scss']
})
export class ComposeMailPage implements OnInit {

  recipient: string = '';
  subject: string = '';
  body: string = '';
  senderEmail: string = '';

  availableEmails: string[] = [];

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const loggedEmail = localStorage.getItem('userEmail');
    if (loggedEmail) {
      this.senderEmail = loggedEmail; // dùng email người login
    }

    // đảm bảo nó có trong danh sách availableEmails
    if (!this.availableEmails.includes(this.senderEmail)) {
      this.availableEmails.unshift(this.senderEmail);
    }
  }

  onSenderEmailChange(event: any) {
    this.senderEmail = event.detail.value;
  }

  private isDraftStarted(): boolean {
    return this.recipient.trim() !== '' ||
      this.subject.trim() !== '' ||
      this.body.trim() !== '';
  }

  async presentDraftActionSheet() {
    const sheet = await this.actionSheetCtrl.create({
      cssClass: 'pill-action-sheet', // dùng class để style hình viên thuốc
      buttons: [
        {
          text: 'Xóa nháp',
          role: 'destructive',
          cssClass: 'pill-button', // class riêng cho nút
          handler: () => this.router.navigate(['/mailbox'])
        },
        {
          text: 'Lưu nháp',
          role: 'default',
          cssClass: 'pill-button save-button',
          handler: () => this.router.navigate(['/mailbox'])
        },
        {
          text: 'Hủy',
          role: 'cancel',
          cssClass: 'pill-button cancel-button' // class riêng cho nút Hủy
        }
      ]
    });

    await sheet.present();
  }


  async closeModal() {
    if (!this.isDraftStarted()) {
      this.router.navigate(['/mailbox']);
      return;
    }

    await this.presentDraftActionSheet();
  }

  // async sendMail() {
  //   if (!this.recipient.trim() || !this.subject.trim() || !this.body.trim()) {
  //     console.warn('Chưa đủ thông tin');
  //     return;
  //   }

  //   // TODO: gọi API gửi mail
  //   this.router.navigate(['/mailbox']);
  // }
  async sendMail() {
    if (!this.recipient.trim() || !this.subject.trim() || !this.body.trim()) {
      console.warn('Chưa đủ thông tin');
      return;
    }

    const recipients = this.recipient.split(',').map(e => e.trim()); // hỗ trợ nhiều người nhận

    const payload = {
      senderId: this.senderEmail, // email người gửi
      recipientsTo: recipients,
      recipientsCc: [],           // nếu muốn thêm CC
      recipientsBcc: [],          // nếu muốn thêm BCC
      subject: this.subject,
      body: this.body
    };

    // Gọi API gửi mail
    this.http.post('http://localhost:8080/emails/send', payload, { responseType: 'text' })
      .subscribe({
        next: (res: any) => {
          console.log('Email đã gửi:', res);
          this.router.navigate(['/mailbox']);
        },
        error: (err) => {
          console.error('Gửi email thất bại:', err);
        }
      });

  }
  async presentScheduleModal() {
    const modal = await this.modalCtrl.create({
      component: ScheduleMailModalComponent,
      cssClass: 'schedule-modal',
      backdropDismiss: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('Scheduled mail:', data);
      // TODO: Save scheduled mail with timing
    }
  }
}
