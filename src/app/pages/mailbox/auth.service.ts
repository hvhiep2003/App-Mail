// src/app/auth.service.ts
import { Injectable } from '@angular/core';

export interface User {
    userId: string;
    name: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private currentUser: User | null = null;

    constructor() {
        // Khi app load, kiểm tra localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.currentUser = JSON.parse(userStr);
        }
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    setCurrentUser(user: User) {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user)); // lưu luôn
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
    }
}
