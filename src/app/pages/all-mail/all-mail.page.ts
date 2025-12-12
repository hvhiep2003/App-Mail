import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
// Chỉ cần import để sử dụng trong code TypeScript (popoverController.create), không cần thêm vào imports của @Component
import { MarkMailPopoverComponent } from '../inbox/mark-mail-popover.component';
import { MoveMailPopoverComponent } from '../inbox/move-mail-popover.component';
import { HttpClientModule } from '@angular/common/http';
import { EmailService, MailDTO, SenderDTO } from './email.service';

interface Mail {
  id: string;
  sender: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  isRead: boolean;
  isFlagged: boolean;
  folder?: 'inbox' | 'sent' | 'draft' | 'trash';
}


@Component({
  selector: 'app-all-mail',
  templateUrl: './all-mail.page.html',
  styleUrls: ['./all-mail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgFor,
    SlicePipe,
    HttpClientModule
    // Đã loại bỏ MarkMailPopoverComponent và MoveMailPopoverComponent khỏi imports
  ]
})
export class AllMailPage implements OnInit {
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  selectedForView: string | null = null;

  // Dữ liệu mẫu (giữ nguyên như Inbox)
  mails: Mail[] = [];
  filteredMails: Mail[] = [];


  constructor(private router: Router, private popoverController: PopoverController, private emailService: EmailService) { }

  deleteMail(mail: Mail) {
    // Xóa mail khỏi danh sách
    this.mails = this.mails.filter(m => m.id !== mail.id);
    this.filteredMails = [...this.mails]; // cập nhật danh sách hiển thị
    this.selectedMails.delete(mail.id); // nếu mail đang được chọn trong edit mode
  }

  ngOnInit() {
    this.loadEmails(); // thay cho this.filteredMails = [...this.mails];
  }

  loadEmails() {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) return;

    this.emailService.getAllEmails(userEmail).subscribe({
      next: (emails) => {
        this.mails = emails.map(e => {
          const senderEmail =
            typeof e.sender === 'object'
              ? e.sender.emailAddress
              : e.sender;

          return {
            id: e.id,
            sender: senderEmail,
            to: e.recipientsTo,
            subject: e.subject,
            body: e.body,
            date: new Date(e.createdAt),
            isRead: e.isRead ?? e.read ?? false,
            isFlagged: e.isFlagged ?? e.starred ?? false,
            folder: senderEmail === userEmail ? 'sent' : 'inbox'
          };
        });

        this.filteredMails = [...this.mails];
      },
      error: (err) => console.error(err)
    });
  }


  selectAllMails(): void {
    const allSelected = this.selectedMails.size === this.filteredMails.length && this.filteredMails.length > 0;
    if (allSelected) {
      this.selectedMails.clear();
    } else {
      this.filteredMails.forEach(mail => this.selectedMails.add(mail.id));
    }
  }

  selectMail(mail: Mail) {
    const userEmail = localStorage.getItem('userEmail');

    this.router.navigate(['/email-detail', mail.id], {
      state: {
        email: mail,
        folder: mail.sender === userEmail ? 'sent' : 'inbox'
      }
    });

  }

  goBack() {
    // Thay đổi đường dẫn theo cấu trúc ứng dụng của bạn
    this.router.navigate(['/mailbox']);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.selectedMails.clear();
    }
  }

  onSearch(event: any) {
    const query = this.searchQuery.toLowerCase();
    this.filteredMails = this.mails.filter(mail =>
      mail.sender.toLowerCase().includes(query) ||
      mail.subject.toLowerCase().includes(query) ||
      mail.body.toLowerCase().includes(query)
    );
  }


  // getAvatarText(sender: string): string {
  //   return sender.charAt(0).toUpperCase();
  // }

  getRelativeTime(mailDate: Date): string {
    const now = new Date('2025-01-15T12:00:00');
    const date = new Date(mailDate);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const mailDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const diffTime = today.getTime() - mailDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const shortTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (mailDay.getTime() === today.getTime()) {
      return shortTime;
    } else if (mailDay.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    } else if (diffDays > 0 && diffDays <= 7) {
      return 'Tuần trước';
    } else {
      return date.toLocaleDateString('vi-VN', { year: '2-digit', month: '2-digit', day: '2-digit' });
    }
  }

  isSelected(mailId: string): boolean {
    return this.selectedMails.has(mailId);
  }

  toggleSelectMail(mailId: string) {
    if (this.selectedMails.has(mailId)) {
      this.selectedMails.delete(mailId);
    } else {
      this.selectedMails.add(mailId);
    }
  }

  async markMails(event: Event) {
    if (this.selectedMails.size === 0) return;

    const popover = await this.popoverController.create({
      component: MarkMailPopoverComponent,
      event: event,
      translucent: true,
      side: 'top',
      alignment: 'start',
      cssClass: 'edit-footer-popover'
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.action) {
      this.handleMarkAction(data.action);
    }
  }

  markStar(mail: Mail) {
    const newValue = !mail.isFlagged;

    this.emailService.setStarStatus(mail.id, newValue).subscribe({
      next: () => {
        mail.isFlagged = newValue; // Cập nhật UI ngay lập tức
      },
      error: err => console.error(err)
    });
  }


  private handleMarkAction(action: string) {
    // Logic Đánh dấu
    if (action === 'readUnread') {
      const hasUnread = this.mails.some(mail => this.selectedMails.has(mail.id) && !mail.isRead);
      const targetIsRead = hasUnread ? true : false;

      this.mails.forEach(mail => {
        if (this.selectedMails.has(mail.id)) {
          mail.isRead = targetIsRead;
        }
      });
    } else if (action === 'trash') {
      this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    } else if (action === 'flag') {

      const emailIds = Array.from(this.selectedMails);

      const hasUnflagged = this.mails.some(mail =>
        this.selectedMails.has(mail.id) && !mail.isFlagged
      );

      // ⭐ 1. Cập nhật UI trước
      this.mails.forEach(mail => {
        if (this.selectedMails.has(mail.id)) {
          mail.isFlagged = hasUnflagged ? true : false;
        }
      });

      // ⭐ 2. Gửi API sau (không ảnh hưởng UI)
      if (hasUnflagged) {
        this.emailService.markEmailsStarred(emailIds).subscribe();
      } else {
        this.emailService.unmarkEmailsStarred(emailIds).subscribe();
      }

    }


    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  private updateStarUI(starred: boolean) {
    this.mails.forEach(mail => {
      if (this.selectedMails.has(mail.id)) {
        mail.isFlagged = starred;
      }
    });
  }

  async moveMails(event: Event) {
    if (this.selectedMails.size === 0) return;

    const popover = await this.popoverController.create({
      component: MoveMailPopoverComponent,
      event: event,
      translucent: true,
      side: 'top',
      alignment: 'end',
      cssClass: 'edit-footer-popover',
      componentProps: {
        currentFolder: 'all' // Truyền thư mục hiện tại là 'all'
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.folder) {
      this.handleMoveAction(data.folder);
    }
  }

  getAvatarText(sender: string): string {
    return sender ? sender.charAt(0).toUpperCase() : '';
  }


  private handleMoveAction(folder: string) {
    if (folder !== 'trash') return;

    const emailIds = Array.from(this.selectedMails);

    this.emailService.moveEmailsToTrash(emailIds).subscribe({
      next: () => {
        this.mails = this.mails.filter(mail => !emailIds.includes(mail.id));
        this.filteredMails = [...this.mails];
        this.selectedMails.clear();
        this.isEditMode = false;
      },
      error: err => {
        console.error('Move to trash failed:', err);
      }
    });

  }


  openEmail(mail: MailDTO) {
    this.router.navigate(['/email-detail'], {
      state: {
        email: mail,
        folder: 'all',
        previousPage: '/all-mail'
      }
    });
  }


  composeMail() {
    this.router.navigate(['/compose']);
  }
}