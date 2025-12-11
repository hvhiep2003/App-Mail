import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, SlicePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular'; 
import { MarkMailPopoverComponent } from '../inbox/mark-mail-popover.component'; 
import { MoveMailPopoverComponent } from '../inbox/move-mail-popover.component'; 


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
  selector: 'app-spam-mail',
  templateUrl: './spam-mail.page.html',
  styleUrls: ['./spam-mail.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    NgFor,
    SlicePipe 
  ]
})
export class SpamMailPage implements OnInit {
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  selectedForView: string | null = null;
  
  // Dữ liệu mẫu (Giả định là thư rác/spam)
  mails: Mail[] = [
    {
      id: '1',
      sender: 'CasinoOnline@spam.com',
      subject: 'Bạn đã thắng 1 tỷ đồng!',
      body: 'Bấm vào đây ngay để nhận giải thưởng. Nếu không, bạn sẽ bị mất cơ hội...',
      date: new Date('2025-01-16T08:00:00'),
      isRead: false,
      isFlagged: false 
    },
    {
      id: '2',
      sender: 'Faketax@gov.vn',
      subject: 'Thông báo nộp phạt khẩn cấp',
      body: 'Tài khoản của bạn đã bị khóa. Vui lòng cung cấp mật khẩu để xác minh...',
      date: new Date('2025-01-15T15:30:00'),
      isRead: true,
      isFlagged: false 
    },
  ];

  filteredMails: Mail[] = [];

  constructor(private router: Router, private popoverController: PopoverController) {}

  ngOnInit() {
    this.filteredMails = [...this.mails];
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
  
  /**
   * Phương thức tính toán thời gian tương đối
   */
  getRelativeTime(mailDate: Date): string {
    const now = new Date('2025-01-16T12:00:00'); // Giả định thời điểm hiện tại
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
      cssClass: 'edit-footer-popover',
      // TRUYỀN currentFolder LÀ 'spam' ĐỂ ẨN NÚT 'Di chuyển vào thư rác'
      componentProps: {
        currentFolder: 'spam' 
      }
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
        currentFolder: 'spam' 
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
       // Hành động 'trash' (chỉ xảy ra khi currentFolder là 'inbox', 'sent',...)
       this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    } else if (action === 'flag') {
        const hasUnflagged = this.mails.some(mail => this.selectedMails.has(mail.id) && !mail.isFlagged);
        const targetIsFlagged = hasUnflagged ? true : false;
        
        this.mails.forEach(mail => {
          if (this.selectedMails.has(mail.id)) {
            mail.isFlagged = targetIsFlagged;
          }
        });
    }
    
    this.filteredMails = [...this.mails]; 
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  private handleMoveAction(folder: string) {
    // Hành động Di chuyển khỏi thư spam (giả định là khôi phục hoặc xóa vĩnh viễn)
    this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    
    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}