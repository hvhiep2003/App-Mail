import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule,]
})
export class AccountPage implements OnInit {

  users: any[] = [];
  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.loadUsers();
  }

  ionViewWillEnter() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get('http://localhost:8080/users')
      .subscribe({
        next: (res: any) => {
          this.users = res;
        },
        error: (err) => {
          console.error('Error loading users', err);
        }
      });
  }

  goBack() {
    this.router.navigate(['/mailbox']);
  }

}