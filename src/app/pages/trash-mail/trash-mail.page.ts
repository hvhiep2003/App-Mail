import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, SlicePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular'; 
// Chỉ import để sử dụng trong TypeScript (popoverController.create)
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
  mails: Mail[] = [
    {
      id: '1',
      sender: 'Spam@ads.com',
      subject: 'Bạn đã trúng thưởng!',
      body: 'Đây là thư rác đã bị xóa vào thùng rác...',
      date: new Date('2025-01-10T11:00:00'),
      isRead: false,
      isFlagged: false 
    },
    {
      id: '2',
      sender: 'Nguyen Van A',
      subject: 'Hóa đơn tháng 12',
      body: 'Tôi đã gửi hóa đơn cho bạn. Vui lòng kiểm tra...',
      date: new Date('2025-01-08T09:30:00'),
      isRead: true,
      isFlagged: false 
    },
    {
      id: '3',
      sender: 'Test mail',
      subject: 'Thư nháp bị xóa',
      body: 'Nội dung thư nháp...',
      date: new Date('2025-01-05T15:45:00'),
      isRead: true,
      isFlagged: true 
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
    // Trong thùng rác, hành động 'trash' được hiểu là Xóa vĩnh viễn.
    if (action === 'readUnread') {
      const hasUnread = this.mails.some(mail => this.selectedMails.has(mail.id) && !mail.isRead);
      const targetIsRead = hasUnread ? true : false; 
      
      this.mails.forEach(mail => {
        if (this.selectedMails.has(mail.id)) {
          mail.isRead = targetIsRead; 
        }
      });
    } else if (action === 'trash') {
       // Xóa vĩnh viễn khỏi danh sách
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
    // Hành động Di chuyển trong thùng rác tương đương với Khôi phục (xóa khỏi danh sách hiện tại)
    this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    
    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}