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
  senderDisplay: string = '';
  recipientsDisplay: string = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private emailService: EmailService,
    private cdr: ChangeDetectorRef
  ) { }

  getSenderEmail() {
    return this.senderDisplay || (this.email ? (typeof this.email.sender === 'string' ? this.email.sender : this.email.sender?.emailAddress || this.email.sender?.username) : '');
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras?.state?.['email'];
    this.folder = nav?.extras?.state?.['folder'] || 'inbox';
    this.previousPage = nav?.extras?.state?.['previousPage'] || '/all-mail';

    if (this.email) {
      // --- chuẩn hóa sender hiển thị ---
      this.senderDisplay = typeof this.email.sender === 'string'
        ? this.email.sender
        : (this.email.sender?.emailAddress || this.email.sender?.username || '');

      // --- chuẩn hóa recipients (recipientsTo hoặc to) ---
      const recipients = (this.email as any).recipientsTo ?? (this.email as any).to ?? '';
      this.recipientsDisplay = Array.isArray(recipients)
        ? recipients.map((r: any) => r.emailAddress ?? r).join(', ')
        : recipients;

      // nếu backend không kèm date, dùng createdAt
      if (!(this.email as any).date) {
        (this.email as any).date = this.email.createdAt ? new Date(this.email.createdAt) : new Date();
      }

      // detect changes (nếu cần)
      this.cdr.detectChanges();
      return;
    }

    // nếu không có state thì lấy từ API bằng id
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/all-mail']);
      return;
    }

    this.emailService.getEmailById(id).subscribe({
      next: (mail: MailDTO) => {
        // chuẩn hóa email object
        this.email = { ...mail };

        this.senderDisplay = typeof mail.sender === 'string'
          ? mail.sender
          : (mail.sender?.emailAddress || mail.sender?.username || '');

        const recipients = mail.recipientsTo ?? (mail as any).to ?? '';
        this.recipientsDisplay = Array.isArray(recipients)
          ? recipients.map((r: any) => r.emailAddress ?? r).join(', ')
          : recipients;

        (this.email as any).date = mail.createdAt ? new Date(mail.createdAt) : (mail.date ? new Date(mail.date) : new Date());

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
