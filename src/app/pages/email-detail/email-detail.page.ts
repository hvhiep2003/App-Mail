import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonModal } from "@ionic/angular/standalone";
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { EmailService, MailDTO, SenderDTO } from '../all-mail/email.service';
import {
  IonContent,
  IonHeader,
  // IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  // IonPopover,
  // IonFab,
  // IonFabButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-email-detail',
  templateUrl: './email-detail.page.html',
  styleUrls: ['./email-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    // IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    // IonPopover,
    IonModal
    // IonFab,
    // IonFabButton
  ]
})
export class EmailDetailPage implements OnInit {
  email!: MailDTO;
  folder: 'inbox' | 'sent' | 'draft' | 'trash' = 'inbox';
  to: string = '';
  isActionOpen = false;
  previousPage: string = '/all-mail';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private emailService: EmailService,
    private cdr: ChangeDetectorRef
  ) { }

  getSenderEmail() {
    if (!this.email) return '';

    if (typeof this.email.sender === 'string') {
      return this.email.sender;
    }

    return this.email.sender.emailAddress;
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras?.state?.['email'];
    this.folder = nav?.extras?.state?.['folder'] || 'inbox';
    this.previousPage = nav?.extras?.state?.['previousPage'] || '/all-mail';

    if (this.email) {
      // Nếu có email từ state, kiểm tra trường 'recipientsTo' hoặc 'to'
      const recipients = (this.email as any).recipientsTo || (this.email as any).to || '';

      // Nếu là mảng, join thành chuỗi
      this.to = Array.isArray(recipients)
        ? recipients.map((r: any) => r.emailAddress || r).join(', ')
        : recipients;

      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/all-mail']);
      return;
    }

    this.emailService.getEmailById(id).subscribe({
      next: (mail: MailDTO) => {
        // Chuẩn hóa email
        this.email = {
          ...mail,
          date: new Date(mail.createdAt)
        };

        // Xử lý 'to' tương tự
        const recipients = mail.recipientsTo || (mail as any).to || '';
        this.to = Array.isArray(recipients)
          ? recipients.map(r => r.emailAddress || r).join(', ')
          : recipients;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi load email', err);
      }
    });
  }

  get fromInitials(): string {
    if (!this.email) return '';
    const sender = typeof this.email.sender === 'string'
      ? this.email.sender
      : this.email.sender.username || this.email.sender.emailAddress;
    return sender.charAt(0).toUpperCase();
  }

  // get to(): string {
  //   // Nếu backend chưa trả to, hiển thị mặc định hoặc email người dùng
  //   return 'admin@gmail.com';
  // }

  closePage() {
    this.router.navigate([this.previousPage]);
  }


  openActions() {
    this.isActionOpen = true;
  }


  // reply() { console.log("Trả lời"); }
  replyAll() { console.log("Trả lời tất cả"); }
  forward() { console.log("Chuyển tiếp"); }
  markUnread() { console.log("Đánh dấu chưa đọc"); }
  delete() { console.log("Xóa thư"); }
  moveToTrash() { console.log("Chuyển vào thùng rác"); }

  closeActions() {
    this.isActionOpen = false;
  }

  reply() {
    this.isActionOpen = false; // đóng modal
    this.cdr.detectChanges(); // đảm bảo modal đã đóng

    this.router.navigate(['/compose'], {
      queryParams: {
        mode: 'reply',
        to: this.email.sender,
        subject: 'Re: ' + this.email.subject
      }
    });
  }
}
