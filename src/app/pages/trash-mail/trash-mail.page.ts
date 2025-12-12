import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
// Chỉ import để sử dụng trong TypeScript (popoverController.create)
import { MarkMailPopoverComponent } from '../inbox/mark-mail-popover.component';
import { MoveMailPopoverComponent } from '../inbox/move-mail-popover.component';
import { EmailService } from '../all-mail/email.service';


interface Mail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  date: Date;
  isRead: boolean;
  isFlagged: boolean;
}

@Component({
  selector: 'app-trash-mail',
  templateUrl: './trash-mail.page.html',
  styleUrls: ['./trash-mail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgFor,
    SlicePipe
  ]
})
export class TrashMailPage implements OnInit {
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  selectedForView: string | null = null;

  // Dữ liệu mẫu (Giả định là thư đã bị xóa)
  mails: Mail[] = [];

  filteredMails: Mail[] = [];

  constructor(private router: Router, private popoverController: PopoverController, private emailService: EmailService) { }

  ngOnInit() {
    this.loadTrashEmails();
  }

  loadTrashEmails() {
    const userEmail = localStorage.getItem('userEmail'); // hoặc từ AuthService
    if (!userEmail) return;

    this.emailService.getTrashEmails(userEmail).subscribe(emails => {
      this.mails = emails.map(e => ({
        id: e.id,
        sender: typeof e.sender === 'object' ? e.sender.emailAddress : e.sender,
        subject: e.subject,
        body: e.body,
        date: new Date(e.createdAt), // dùng createdAt để hiển thị thời gian
        isRead: e.isRead,
        isFlagged: e.starred
      }));

      this.filteredMails = [...this.mails];
    }, err => {
      console.error('Lỗi khi load thùng rác:', err);
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

  selectAllMails() {
    const allSelected = this.selectedMails.size === this.filteredMails.length && this.filteredMails.length > 0;

    if (allSelected) {
      this.selectedMails.clear();
    } else {
      this.selectedMails.clear();
      this.filteredMails.forEach(mail => this.selectedMails.add(mail.id));
    }
  }

  getAvatarText(sender: string): string {
    return sender.charAt(0).toUpperCase();
  }

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

  selectMail(mail: Mail) {
    this.selectedForView = mail.id;
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
        // TRUYỀN THƯ MỤC HIỆN TẠI LÀ 'trash'
        currentFolder: 'trash'
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.folder) {
      this.handleMoveAction(data.folder);
    }
  }

  private handleMarkAction(action: string) {
    if (action === 'trash') {
      // Gọi backend xóa vĩnh viễn
      this.emailService.deleteEmailsPermanently(Array.from(this.selectedMails)).subscribe(() => {
        this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
        this.filteredMails = [...this.mails];
        this.selectedMails.clear();
        this.isEditMode = false;
      });
    } else if (action === 'flag') {
      const hasUnflagged = this.mails.some(mail => this.selectedMails.has(mail.id) && !mail.isFlagged);
      const targetIsFlagged = hasUnflagged ? true : false;

      this.mails.forEach(mail => {
        if (this.selectedMails.has(mail.id)) {
          mail.isFlagged = targetIsFlagged;
        }
      });

      this.filteredMails = [...this.mails];
      this.selectedMails.clear();
      this.isEditMode = false;
    }
  }

  private handleMoveAction(folder: string) {
    // Trong Trash, Move = Restore về Inbox
    this.emailService.restoreEmailsFromTrash(Array.from(this.selectedMails)).subscribe(() => {
      this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
      this.filteredMails = [...this.mails];
      this.selectedMails.clear();
      this.isEditMode = false;
    });
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}