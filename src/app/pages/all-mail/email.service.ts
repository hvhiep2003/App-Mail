import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

// email.service.ts
export interface SenderDTO {
    userId: string;
    username: string;
    emailAddress: string;
}

export interface MailDTO {
    id: string;
    sender: SenderDTO | string; // sender có thể là object hoặc string
    recipientsTo: string;
    recipientsCc?: string;
    recipientsBcc?: string;
    subject: string;
    body: string;
    date: Date;       // backend trả về ISO string
    isRead: boolean;
    isFlagged: boolean;
    createdAt: string;
    read: boolean;
    starred: boolean;

}

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    private baseUrl = 'http://localhost:8080/emails'; // đổi theo backend của bạn

    constructor(private http: HttpClient,) { }

    // Lấy tất cả email của user
    getAllEmails(userEmail: string): Observable<MailDTO[]> {
        return this.http.get<MailDTO[]>(`${this.baseUrl}/all?userEmail=${userEmail}`);
    }

    // Lấy 1 email theo id
    getEmailById(id: string | null): Observable<MailDTO> {
        if (!id) throw new Error('Email id is null');
        return this.http.get<MailDTO>(`${this.baseUrl}/${id}`);
    }

    // Lấy email đã gửi
    getSentEmails(userEmail: string): Observable<MailDTO[]> {
        return this.http.get<MailDTO[]>(`${this.baseUrl}/sent?userEmail=${userEmail}`);
    }

    getInboxEmails(userEmail: string): Observable<MailDTO[]> {
        return this.http.get<MailDTO[]>(`${this.baseUrl}/inbox?userEmail=${userEmail}`);
    }

    saveDraft(mail: MailDTO): Observable<MailDTO> {
        return this.http.post<MailDTO>(`${this.baseUrl}/draft`, mail);
    }

    getDrafts(userEmail: string): Observable<MailDTO[]> {
        return this.http.get<MailDTO[]>(`${this.baseUrl}/draft?userEmail=${userEmail}`);
    }


}
