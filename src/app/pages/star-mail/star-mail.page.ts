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
  selector: 'app-star-mail', // Cập nhật selector
  templateUrl: './star-mail.page.html', // Cập nhật template
  styleUrls: ['./star-mail.page.scss'], // Cập nhật styles
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    NgFor,
    SlicePipe 
  ]
})
export class StarMailPage implements OnInit { // Cập nhật tên Class
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  selectedForView: string | null = null;
  
  // Dữ liệu mẫu (Giả định là thư đã gắn cờ/quan trọng)
  mails: Mail[] = [
    {
      id: '1',
      sender: 'Quan trọng A',
      subject: 'Thông báo dự án mới Q3',
      body: 'Đây là thư quan trọng. Vui lòng xem xét ASAP.',
      date: new Date('2025-01-14T11:00:00'),
      isRead: false,
      isFlagged: true // Luôn là true cho thư quan trọng
    },
    {
      id: '2',
      sender: 'Hỗ trợ Khách hàng',
      subject: 'Yêu cầu hỗ trợ khẩn cấp #1234',
      body: 'Yêu cầu từ khách hàng VIP cần được xử lý ngay lập tức...',
      date: new Date('2025-01-08T09:30:00'),
      isRead: true,
      isFlagged: true // Luôn là true cho thư quan trọng
    },
    {
      id: '3',
      sender: 'Lịch làm việc',
      subject: 'Xác nhận cuộc họp 16/01/2025',
      body: 'Cuộc họp về chiến lược marketing sẽ diễn ra lúc 10h...',
      date: new Date('2025-01-05T15:45:00'),
      isRead: true,
      isFlagged: true // Luôn là true cho thư quan trọng
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
  
  // Giữ nguyên logic tính thời gian
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
    // Chuyển sang trang xem thư chi tiết
    // this.router.navigate(['/mail', mail.id]);
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
      // THÊM: Truyền currentFolder để Popover biết nó đang ở trang Star Mail
      componentProps: { 
        currentFolder: 'star' 
      }
      // KẾT THÚC THÊM
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
        // TRUYỀN THƯ MỤC HIỆN TẠI LÀ 'star'
        currentFolder: 'star' 
      }
    });

    await popover.present();
    
    const { data } = await popover.onDidDismiss();
    if (data && data.folder) {
      this.handleMoveAction(data.folder);
    }
  }

  private handleMarkAction(action: string) {
    // Trong trang Thư quan trọng, hành động 'flag' được hiểu là Bỏ gắn cờ, 
    // tương đương với việc xóa thư khỏi danh sách hiện tại.
    
    if (action === 'readUnread') {
      const hasUnread = this.mails.some(mail => this.selectedMails.has(mail.id) && !mail.isRead);
      const targetIsRead = hasUnread ? true : false; 
      
      this.mails.forEach(mail => {
        if (this.selectedMails.has(mail.id)) {
          mail.isRead = targetIsRead; 
        }
      });
    } else if (action === 'trash') {
       // Hành động 'trash' (Xóa) chuyển thư về thùng rác, xóa khỏi danh sách hiện tại.
       this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    } else if (action === 'flag') {
        // Hành động 'flag' (Gắn cờ/Bỏ gắn cờ) -> Bỏ gắn cờ và xóa khỏi danh sách Star
        this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    }
    
    this.filteredMails = [...this.mails]; 
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  private handleMoveAction(folder: string) {
    // Hành động Di chuyển (move) xóa thư khỏi danh sách hiện tại.
    this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    
    this.filteredMails = [...this.mails];
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}