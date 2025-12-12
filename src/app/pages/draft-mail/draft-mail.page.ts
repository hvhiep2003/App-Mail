import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EmailService, MailDTO, SenderDTO } from '../all-mail/email.service';

interface Draft {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  date: Date;
  status: string;
}

@Component({
  selector: 'app-draft-mail',
  templateUrl: './draft-mail.page.html',
  styleUrls: ['./draft-mail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DraftMailPage implements OnInit {
  isEditMode: boolean = false;
  searchQuery: string = '';
  selectedDrafts: Set<string> = new Set();
  selectedForEdit: string | null = null;

  drafts: Draft[] = [
    // {
    //   id: '1',
    //   recipient: 'Không có người nhận',
    //   subject: 'Không có chủ đề',
    //   body: 'Thư này không có nội dung',
    //   date: new Date('2025-01-15'),
    //   status: 'Thư nháp'
    // }
  ];

  filteredDrafts: Draft[] = [];

  constructor(private router: Router, private emailService: EmailService) { }

  // ngOnInit() {
  //   this.filteredDrafts = [...this.drafts];
  // }

  ngOnInit() {
    const userEmail = localStorage.getItem('userEmail') || '';

    // Lấy nháp từ backend
    this.emailService.getDrafts(userEmail).subscribe({
      next: (drafts) => {
        // Map dữ liệu backend về kiểu Draft dùng trong component
        this.drafts = drafts.map(d => ({
          id: d.id!,
          recipient: d.recipientsTo || 'Chưa có người nhận',
          subject: d.subject || 'Chưa có chủ đề',
          body: d.body || '',
          date: d.createdAt ? new Date(d.createdAt) : new Date(),
          status: 'Thư nháp'
        }));

        this.filteredDrafts = [...this.drafts];
      },
      error: (err) => {
        console.error('Lấy nháp thất bại', err);
        this.drafts = [];
        this.filteredDrafts = [];
      }
    });
  }

  closeModal() {
    this.router.navigate(['/mailbox']);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.selectedDrafts.clear();
    }
  }

  onSearch(event: any) {
    const query = this.searchQuery.toLowerCase();
    this.filteredDrafts = this.drafts.filter(draft =>
      draft.recipient.toLowerCase().includes(query) ||
      draft.subject.toLowerCase().includes(query) ||
      draft.body.toLowerCase().includes(query)
    );
  }

  openDraft(draft: Draft) {
    // Set selected draft and show edit button
    this.selectedForEdit = draft.id;
  }

  editSelectedDraft() {
    if (this.selectedForEdit) {
      const draft = this.drafts.find(d => d.id === this.selectedForEdit);
      if (draft) {
        // Navigate to compose page with draft data for editing
        this.router.navigate(['/compose'], {
          queryParams: { draftId: draft.id, edit: true }
        });
      }
    }
  }

  isSelected(draftId: string): boolean {
    return this.selectedDrafts.has(draftId);
  }

  toggleSelectDraft(draftId: string) {
    if (this.selectedDrafts.has(draftId)) {
      this.selectedDrafts.delete(draftId);
    } else {
      this.selectedDrafts.add(draftId);
    }
  }

  deleteSelectedDrafts() {
    this.drafts = this.drafts.filter(draft => !this.selectedDrafts.has(draft.id));
    this.filteredDrafts = this.drafts.filter(draft => !this.selectedDrafts.has(draft.id));
    this.selectedDrafts.clear();
    this.selectedForEdit = null;
  }

  composeMail() {
    this.router.navigate(['/compose']);
  }
}
