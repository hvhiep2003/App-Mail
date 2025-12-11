import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, SlicePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular'; 
// Giả định MarkMailPopoverComponent và MoveMailPopoverComponent đã được định nghĩa
import { MarkMailPopoverComponent } from '../inbox/mark-mail-popover.component'; 
import { MoveMailPopoverComponent } from '../inbox/move-mail-popover.component'; 


interface Mail {
  id: string;
  sender: string; // Tên người nhận (Recipient)
  subject: string;
  body: string;
  scheduleDate: Date; // Thay đổi thuộc tính Date thành ScheduleDate
  isRead: boolean; 
  isFlagged: boolean; 
}

@Component({
  selector: 'app-scheduled-mail',
  templateUrl: './scheduled-mail.page.html',
  styleUrls: ['./scheduled-mail.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    NgFor,
    SlicePipe 
  ]
})
export class ScheduledMailPage implements OnInit {
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedMails: Set<string> = new Set();
  
  mails: Mail[] = [
    // Dữ liệu mẫu (Giả định ngày hiện tại: 2025-12-02)
    {
      id: '1',
      sender: 'Nhóm Phát triển',
      subject: 'Thông báo triển khai phiên bản mới',
      body: 'Thư này sẽ được gửi vào sáng ngày mai lúc 8:00 AM...',
      scheduleDate: new Date('2025-12-03T08:00:00'), 
      isRead: true, 
      isFlagged: false 
    },
    {
      id: '2',
      sender: 'CEO',
      subject: 'Thư chúc mừng năm mới',
      body: 'Thư sẽ tự động gửi vào 00:00:01 ngày 01/01/2026. Vui lòng không chỉnh sửa.',
      scheduleDate: new Date('2026-01-01T00:00:01'),
      isRead: true,
      isFlagged: true 
    },
    {
      id: '3',
      sender: 'Phòng Nhân sự',
      subject: 'Lời nhắc hoàn thành khảo sát',
      body: 'Hạn chót là 12:00 PM thứ Sáu tuần này. Thư nhắc sẽ gửi vào 10:00 AM.',
      scheduleDate: new Date('2025-12-06T10:00:00'),
      isRead: true,
      isFlagged: false 
    },
    {
      id: '4',
      sender: 'Tester',
      subject: 'Thư đã quá hạn test',
      body: 'Lẽ ra thư này phải gửi vào ngày hôm qua. Cần kiểm tra lại!',
      scheduleDate: new Date('2025-12-01T10:00:00'), // Đã quá hạn
      isRead: true,
      isFlagged: false 
    },
  ];

  filteredMails: Mail[] = [];

  constructor(private router: Router, private popoverController: PopoverController) {}

  ngOnInit() {
    this.mails.sort((a, b) => a.scheduleDate.getTime() - b.scheduleDate.getTime()); 
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
    const now = new Date('2025-12-02T13:20:00'); 
    const date = new Date(mailDate);

    const diffTime = date.getTime() - now.getTime();
    
    if (diffTime < 0) {
        return 'Quá hạn'; 
    }
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const mailDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const shortTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (mailDay.getTime() === today.getTime()) {
      return `Hôm nay, ${shortTime}`; 
    } else if (mailDay.getTime() === tomorrow.getTime()) {
      return `Ngày mai, ${shortTime}`; 
    } else {
      const datePart = date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      return `${datePart}, ${shortTime}`;
    }
  }

  selectMail(mail: Mail) {
    this.router.navigate(['/view-scheduled', mail.id]);
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

  /**
   * MARK MAILS - Truyền currentFolder: 'scheduled' để popover chỉ hiển thị FLAG/UNFLAG.
   */
  async markMails(event: Event) {
    if (this.selectedMails.size === 0) return;

    const popover = await this.popoverController.create({
      component: MarkMailPopoverComponent, 
      event: event,
      translucent: true,
      side: 'top', 
      alignment: 'start',
      cssClass: 'edit-footer-popover',
      componentProps: { 
        currentFolder: 'scheduled' // Dùng để lọc menu trong popover
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.action) {
      this.handleMarkAction(data.action);
    }
  }

  /**
   * MOVE MAILS - Truyền currentFolder: 'scheduled' để popover ẩn nút 'Đã gửi'.
   */
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
        currentFolder: 'scheduled' // Dùng để lọc menu trong popover
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.folder) {
      // Bất kể di chuyển đến thư mục nào, ta thực hiện HỦY LỊCH/XÓA
      this.handleMoveAction(data.folder); 
    }
  }

  /**
   * LOGIC XỬ LÝ HÀNH ĐỘNG ĐÁNH DẤU (Chỉ còn Flag vì popover đã lọc menu)
   */
  private handleMarkAction(action: string) {
    // Chỉ xử lý FLAG/UNFLAG, các hành động khác (readUnread, trash) đã bị loại bỏ khỏi popover menu.
    if (action === 'flag') {
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
  
  /**
   * LOGIC XỬ LÝ HÀNH ĐỘNG DI CHUYỂN (Ánh xạ thành HỦY LỊCH/XÓA)
   */
  private handleMoveAction(folder: string) {
    // Di chuyển (bất kể folder là gì) đều ánh xạ thành HỦY LỊCH/XÓA
    this.mails = this.mails.filter(mail => !this.selectedMails.has(mail.id));
    
    this.filteredMails = [...this.mails]; 
    this.selectedMails.clear();
    this.isEditMode = false;
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}