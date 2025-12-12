import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { MarkMailPopoverComponent } from '../inbox/mark-mail-popover.component';
import { MoveMailPopoverComponent } from '../inbox/move-mail-popover.component';
import { EmailService, MailDTO } from '../all-mail/email.service';


interface Mail {
  id: string;
  sender: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  isRead: boolean;
  isFlagged: boolean;
}

@Component({
  selector: 'app-sent-mail',
  templateUrl: './sent-mail.page.html',
  styleUrls: ['./sent-mail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgFor,
    SlicePipe
  ]
})
export class SentMailPage implements OnInit {
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  selectedForView: string | null = null;

  mails: Mail[] = [];
  filteredMails: Mail[] = [];

  constructor(private router: Router, private popoverController: PopoverController, private emailService: EmailService) { }

  ngOnInit() {
    const userEmail = localStorage.getItem('userEmail'); // lấy email người dùng hiện tại
    if (userEmail) {
      this.loadAllEmails(userEmail);
    }
  }

  loadAllEmails(userEmail: string) {
    this.emailService.getSentEmails(userEmail).subscribe({
      next: (emails) => {
        this.mails = emails.map(e => ({
          id: e.id,
          sender: typeof e.sender === 'object' ? e.sender.emailAddress : e.sender,
          to: e.recipientsTo,
          subject: e.subject,
          body: e.body,
          date: new Date(e.createdAt),
          isRead: e.isRead ?? e.read ?? true,
          isFlagged: e.isFlagged ?? e.starred ?? false
        }));
        this.filteredMails = [...this.mails];
      },
      error: (err) => console.error(err)
    });
  }

  goBack() {
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

  // selectMail(mail: Mail) {
  //   const mailDTO: MailDTO = {
  //     id: mail.id,
  //     sender: mail.sender,
  //     recipientsTo: mail.to,
  //     subject: mail.subject,
  //     body: mail.body,
  //     createdAt: mail.date.toISOString(),
  //     read: mail.isRead,
  //     starred: mail.isFlagged,
  //     date: mail.date,
  //     isRead: mail.isRead,
  //     isFlagged: mail.isFlagged
  //   };


  //   this.router.navigate(['/email-detail', mail.id], {
  //     state: { email: mailDTO }
  //   });
  // }

  selectMail(mail: Mail) {
    const mailDTO: MailDTO = {
      id: mail.id,
      sender: mail.sender,
      recipientsTo: mail.to,
      subject: mail.subject,
      body: mail.body,
      createdAt: mail.date.toISOString(),
      read: mail.isRead,
      starred: mail.isFlagged,
      date: mail.date,
      isRead: mail.isRead,
      isFlagged: mail.isFlagged
    };

    this.router.navigate(['/email-detail', mail.id], {
      state: { email: mailDTO, folder: 'sent', previousPage: '/sent-mail' }
    });

  }


  selectAllMails() {
    const allSelected = this.selectedMails.size === this.filteredMails.length && this.filteredMails.length > 0;

    if (allSelected) {
      this.selectedMails.clear();
    }
    else {
      this.filteredMails.forEach(mail => this.selectedMails.add(mail.id));
    }
  }

  getAvatarText(sender: string): string {
    return sender.charAt(0).toUpperCase();
  }

  /**
   * Phương thức tính toán thời gian tương đối
   */
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


  // selectMail(mail: Mail) {
  //   this.selectedForView = mail.id;
  // }

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
        currentFolder: 'sent' // Truyền tên thư mục hiện tại là 'sent'
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.folder) {
      this.handleMoveAction(data.folder);
    }
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

    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }


  private handleMoveAction(folder: string) {
    // Logic Di chuyển (Giả lập xóa khỏi danh sách hiện tại)
    this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));

    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}