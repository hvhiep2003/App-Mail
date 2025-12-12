import { Component, HostListener } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ComposeMailPage } from '../compose-mail/compose-mail.page'; // chỉ dùng cho modal
import { ModalController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmailService, MailDTO } from '../all-mail/email.service';


@Component({
  selector: 'app-mailbox',
  standalone: true,

  imports: [IonicModule, CommonModule, FormsModule, RouterModule],

  templateUrl: './mailbox.page.html',
  styleUrls: ['./mailbox.page.scss']
})
export class MailboxPage {

  currentUserName: string = '';
  isAdmin = true;
  isCreateFolderOpen = false;
  folderName = '';
  isChild = false;
  parentId: string | null = null;
  searchQuery: string = '';
  filteredEmails: MailDTO[] = [];
  folders: any[] = [];
  // === Popover cha (3 chấm) ===
  isOpen = false;
  popoverEvent: any;
  popoverFolder: any;
  emails: MailDTO[] = [];


  // === Popover con (Di chuyển) ===
  isMovePopoverOpen = false;
  movePopoverEvent: any;
  foldersList = [
    { id: 1, name: 'Inbox', link: '/inbox', icon: 'mail-outline' },
    { id: 2, name: 'Sent', link: '/sent-mail', icon: 'send-outline' },
    { id: 3, name: 'Draft', link: '/drafts', icon: 'document-text-outline' },
    { id: 4, name: 'Trash', link: '/trash-mail', icon: 'trash-outline' },
    { id: 5, name: 'Spam', link: '/spam-mail', icon: 'alert-circle-outline' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private menuCtrl: MenuController,
    private router: Router,
    private http: HttpClient,
    private emailService: EmailService
  ) { }


  // === Folder ===
  openCreateFolder() { this.isCreateFolderOpen = true; }
  closeCreateFolder() {
    this.isCreateFolderOpen = false;
    this.folderName = '';
    this.isChild = false;
    this.parentId = null;
  }

  createFolder() {
    if (!this.folderName.trim()) return;

    const newFolder = {
      id: Date.now().toString(),
      name: this.folderName,
      children: [],
      expanded: false,
      hover: false,
      isEditing: true  // bật edit ngay khi tạo
    };

    if (this.isChild && this.parentId) {
      const parent = this.folders.find(f => f.id === this.parentId);
      if (parent) {
        parent.children.push(newFolder);
        parent.expanded = true; // mở parent để nhìn thấy con
      }
    } else {
      this.folders.push(newFolder);
    }

    this.closeCreateFolder();

    // ép Angular detect thay đổi để input hiện ngay
    setTimeout(() => this.cdr.detectChanges(), 10);
  }

  toggleFolder(folder: any) {
    folder.expanded = !folder.expanded;
  }

  // === Popover cha ===
  openPopover(ev: any, folder: any) {
    ev.stopPropagation();
    this.popoverFolder = folder;
    this.popoverEvent = ev;
    this.isOpen = true;
  }

  renameFolder() {
    if (!this.popoverFolder) return;

    this.popoverFolder.isEditing = true;

    // Ép Angular render input
    setTimeout(() => {
      this.cdr.detectChanges();

      // Focus vào input mới tạo
      const el = document.getElementById(`folder-input-${this.popoverFolder.id}`) as HTMLInputElement;
      if (el) el.focus();
    }, 10);

    // KHÔNG closePopover ngay
  }


  finishRename(folder: any) {
    if (!folder.name.trim()) folder.name = "Thư mục không tên";
    folder.isEditing = false;
  }

  deleteFolder() {
    if (!this.popoverFolder) return;

    const idx = this.folders.indexOf(this.popoverFolder);
    if (idx > -1) this.folders.splice(idx, 1);

    this.folders.forEach(f => {
      const childIndex = f.children.findIndex((c: any) => c === this.popoverFolder);
      if (childIndex > -1) f.children.splice(childIndex, 1);
    });

    this.closePopover();
  }

  // === Popover con (Di chuyển) ===
  openMovePopover(ev: any) {
    ev.stopPropagation();
    this.isMovePopoverOpen = true;
    this.movePopoverEvent = ev;
  }

  selectMoveFolder(folder: any) {
    alert(`Di chuyển "${this.popoverFolder.name}" đến "${folder.name}"`);
    this.isMovePopoverOpen = false;
    this.closePopover();
  }

  // === Helpers ===
  closePopover() {
    this.isOpen = false;
    this.popoverFolder = null;
  }

  // === Click ngoài page đóng popover ===
  @HostListener('document:click', ['$event'])
  onPageClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.popover-menu') && this.isOpen) {
      this.closePopover();
    }
    if (!target.closest('.move-popover') && this.isMovePopoverOpen) {
      this.isMovePopoverOpen = false;
    }
  }

  // Mở modal Soạn thư
  async openComposeMail() {
    await this.menuCtrl.close();

    const modal = await this.modalCtrl.create({
      component: ComposeMailPage, // Angular vẫn biết để tạo modal
      cssClass: 'compose-mail-modal'
    });

    await modal.present();

    const result = await modal.onDidDismiss();
    console.log('Modal closed with role:', result.role);

    if (result.role === 'cancel') {
      console.log("Trở về MailboxPage");
    }
  }

  logout() {
    // Đóng menu
    this.menuCtrl.close();
    // Navigate về login page
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.loadFolders();
    this.loadAllEmails();
  }

  loadFolders() {
    this.http.get<any[]>('http://localhost:8080/folders').subscribe({
      next: (res) => {
        this.folders = res.map(f => ({
          id: f.folderId,
          name: f.folderName,
          children: [],
          expanded: false,
          isEditing: false,
          icon: this.getFolderIcon(f.folderName),
          link: this.getFolderLink(f.folderName)
        }));
      },
      error: (err) => console.error('Load folders error', err)
    });
  }

  loadAllEmails() {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) return;

    this.emailService.getAllEmails(userEmail).subscribe({
      next: (emails) => {
        this.emails = emails;
        this.filteredEmails = [...this.emails];
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredEmails = [...this.emails];
      return;
    }

    this.filteredEmails = this.emails.filter(mail => {
      const sender = typeof mail.sender === 'string' ? mail.sender : mail.sender.emailAddress || '';
      const subject = mail.subject || '';
      const body = mail.body || '';
      const dateStr = new Date(mail.createdAt).toLocaleDateString('vi-VN');

      return (
        sender.toLowerCase().includes(query) ||
        subject.toLowerCase().includes(query) ||
        body.toLowerCase().includes(query) ||
        dateStr.includes(query)
      );
    });
  }


  openMail(mail: any) {
    const userEmail = localStorage.getItem('userEmail');

    // chuẩn hóa sender để tránh [object Object]
    const senderEmail = typeof mail.sender === 'object'
      ? mail.sender.emailAddress
      : mail.sender;

    // xác định thư này là inbox hay sent
    const folder = senderEmail === userEmail ? 'sent' : 'inbox';

    this.router.navigate(['/email-detail', mail.id], {
      state: {
        email: {
          ...mail,
          sender: senderEmail
        },
        folder: 'mailbox',
        previousPage: '/mailbox'
      }
    });
  }


  getSender(mail: MailDTO): string {
    if (!mail.sender) return 'Unknown';

    // Nếu sender là string
    if (typeof mail.sender === 'string') return mail.sender;

    // Nếu sender là object
    return mail.sender.emailAddress || 'Unknown';
  }

  getSenderEmail(mail: MailDTO): string {
    if (!mail.sender) return 'Unknown';

    // sender dạng string
    if (typeof mail.sender === 'string') {
      return mail.sender;
    }

    // sender dạng object
    return mail.sender.emailAddress || 'Unknown';
  }



  getSenderLetter(mail: MailDTO): string {
    if (!mail.sender) return 'U';

    // sender là string => lấy ký tự đầu
    if (typeof mail.sender === 'string') {
      return mail.sender[0].toUpperCase();
    }

    // sender là object => lấy first letter của email
    return (mail.sender.emailAddress || 'U')[0].toUpperCase();
  }


  getFolderIcon(name: string): string {
    switch (name.toLowerCase()) {
      case 'inbox': return 'mail-outline';
      case 'sent': return 'send-outline';
      case 'draft': return 'document-text-outline';
      case 'trash': return 'trash-outline';
      case 'spam': return 'alert-circle-outline';
      default: return 'folder-outline';
    }
  }
  getFolderNameVN(name: string): string {
    switch (name.toLowerCase()) {
      case 'inbox': return 'Hộp thư đến';
      case 'sent': return 'Đã gửi';
      case 'draft': return 'Thư nháp';
      case 'trash': return 'Thùng rác';
      case 'spam': return 'Thư rác';
      default: return name;
    }
  }

  getFolderLink(name: string): string {
    switch (name.toLowerCase()) {
      case 'inbox': return '/inbox';
      case 'sent': return '/sent-mail';
      case 'draft': return '/draft-mail';
      case 'trash': return '/trash-mail';
      case 'spam': return '/spam-mail';
      default: return '/folder-custom/' + name.toLowerCase(); // folder tự tạo
    }
  }
}
