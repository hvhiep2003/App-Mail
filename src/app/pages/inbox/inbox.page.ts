import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { MarkMailPopoverComponent } from './mark-mail-popover.component';
import { MoveMailPopoverComponent } from './move-mail-popover.component';
import { EmailService, MailDTO, SenderDTO } from '../all-mail/email.service';

interface Mail {
  // ... (giữ nguyên Mail interface)
  id: string;
  sender: string | SenderDTO;
  recipientsTo: string;
  subject: string;
  body: string;
  date: Date;
  isRead: boolean;
  isFlagged: boolean;
}

@Component({
  // ... (giữ nguyên component metadata)
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgFor,
    // DatePipe, // Đã loại bỏ
    SlicePipe,
    // MarkMailPopoverComponent, // Đã loại bỏ
    // MoveMailPopoverComponent // Đã loại bỏ
  ]
})
export class InboxPage implements OnInit {
  // ... (giữ nguyên properties và methods khác)
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  selectedForView: string | null = null;

  mails: Mail[] = [];
  filteredMails: Mail[] = [];

  constructor(private router: Router, private popoverController: PopoverController, private emailService: EmailService) { }

  ngOnInit() {
    this.loadInboxMails();
  }

  loadInboxMails() {
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com'; // lấy user hiện tại

    this.emailService.getInboxEmails(userEmail).subscribe({
      next: (data) => {
        // map date string từ backend về Date object
        this.mails = data.map(mail => ({
          ...mail,
          sender: typeof mail.sender === 'object' ? mail.sender.emailAddress : mail.sender, // người gửi email
          recipientsTo: Array.isArray(mail.recipientsTo) ? mail.recipientsTo.join(', ') : mail.recipientsTo, // người nhận (bao gồm bạn)
          date: mail.date ? new Date(mail.date) : new Date()
        }));

        this.filteredMails = [...this.mails];
      },
      error: (err) => console.error('Lỗi tải Inbox:', err)
    });
  }

  getSenderEmail(sender: string | SenderDTO): string {
    return typeof sender === 'string' ? sender : sender.emailAddress;
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
    this.filteredMails = this.mails.filter(mail => {
      const senderStr = typeof mail.sender === 'string' ? mail.sender : mail.sender.username;
      return senderStr.toLowerCase().includes(query) ||
        mail.subject.toLowerCase().includes(query) ||
        mail.body.toLowerCase().includes(query);
    });
  }


  selectAllMails() {
    const allSelected = this.selectedMails.size === this.filteredMails.length && this.filteredMails.length > 0;

    if (allSelected) {
      this.selectedMails.clear();
    } else {
      this.selectedMails.clear();
      this.filteredMails.forEach(mail => this.selectedMails.add(mail.id));
    }
  }

  /**
   * Phương thức lấy chữ cái đầu tiên của người gửi cho Avatar
   * @param sender Tên người gửi
   * @returns Chữ cái đầu tiên (viết hoa)
   */
  getAvatarText(sender: string | SenderDTO): string {
    if (typeof sender === 'string') {
      return sender.charAt(0).toUpperCase();
    } else {
      // Nếu sender là object, lấy username
      return sender.username.charAt(0).toUpperCase();
    }
  }


  /**
   * Phương thức tính toán thời gian tương đối (Hôm nay, Hôm qua, Tuần trước)
   * Giả định ngày hiện tại là 2025-01-15
   * @param mailDate Ngày gửi thư
   * @returns Chuỗi thời gian tương đối
   */
  getRelativeTime(mailDate: Date | null): string {
    if (!mailDate || isNaN(mailDate.getTime())) return ''; // Không có ngày thì trả rỗng

    const now = new Date('2025-01-15T12:00:00');
    const date = new Date(mailDate);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const mailDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const diffTime = today.getTime() - mailDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const shortTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (mailDay.getTime() === today.getTime()) return shortTime;
    if (mailDay.getTime() === yesterday.getTime()) return 'Hôm qua';
    if (diffDays > 0 && diffDays <= 7) return 'Tuần trước';
    return date.toLocaleDateString('vi-VN', { year: '2-digit', month: '2-digit', day: '2-digit' });
  }


  // selectMail(mail: Mail) {
  //   this.selectedForView = mail.id;
  //   const mailToUpdate = this.mails.find(m => m.id === mail.id);
  //   if (mailToUpdate) {
  //     mailToUpdate.isRead = true;
  //     this.filteredMails = [...this.mails];
  //   }
  // }

  // selectMail(mail: Mail) {
  //   const mailToUpdate = this.mails.find(m => m.id === mail.id);
  //   if (mailToUpdate) {
  //     mailToUpdate.isRead = true;
  //     this.filteredMails = [...this.mails];
  //   }

  //   const mailDTO: MailDTO = {
  //     id: mail.id,
  //     sender: typeof mail.sender === 'string' ? mail.sender : mail.sender.username,
  //     recipientsTo: '', // nếu backend trả recipients
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
      sender: typeof mail.sender === 'string' ? mail.sender : mail.sender.username,
      recipientsTo: Array.isArray(mail.recipientsTo) ? mail.recipientsTo.join(', ') : mail.recipientsTo,
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
      state: {
        email: mailDTO,
        folder: 'inbox',
        previousPage: '/inbox'
      }
    });

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
      // THÊM componentProps ĐỂ TRUYỀN THƯ MỤC HIỆN TẠI
      componentProps: {
        currentFolder: 'inbox'
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.folder) {
      this.handleMoveAction(data.folder);
    }
  }

  private handleMoveAction(folder: string) {
    console.log(`Đã chọn thư mục Di chuyển: ${folder} cho ${this.selectedMails.size} thư.`);

    this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));

    console.log(`Đã di chuyển thư đến thư mục: ${folder}`);
    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }


  composeMail() {
    this.router.navigate(['/compose']);
  }
}