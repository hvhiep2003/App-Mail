import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

interface ScheduleOption {
  id: string;
  title: string;
  icon: string;
  time: string;
  date: string;
}

@Component({
  selector: 'app-schedule-mail-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgFor],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ showCustomSchedule ? 'CHỌN NGÀY VÀ GIỜ' : 'LÊN LỊCH GỬI' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="schedule-content">
      <!-- Schedule Options Grid (visible by default) -->
      <div class="schedule-grid" *ngIf="!showCustomSchedule">
        <div *ngFor="let option of scheduleOptions" class="schedule-card" (click)="selectSchedule(option)">
          <ion-icon [name]="option.icon" class="schedule-icon"></ion-icon>
          <h3 class="schedule-title">{{ option.title }}</h3>
          <p class="schedule-time">{{ option.time }}</p>
          <p class="schedule-date">{{ option.date }}</p>
        </div>
      </div>

      <!-- Custom Schedule Form (visible only when selected) -->
      <div class="custom-schedule-form" *ngIf="showCustomSchedule">
        <div class="form-group">
          <ion-input 
            type="date" 
            [(ngModel)]="customDate"
            class="date-input"
            placeholder="Ngày"
          ></ion-input>
        </div>

        <div class="form-group">
          <ion-input 
            type="time" 
            [(ngModel)]="customTime"
            class="time-input"
            placeholder="Giờ"
          ></ion-input>
        </div>

        <div class="button-group">
          <ion-button expand="block" fill="outline" (click)="backToSchedule()">
            Hủy
          </ion-button>
          <ion-button expand="block" color="primary" (click)="confirmCustomSchedule()">
            Lên lịch gửi
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-header {
      border-bottom: 1px solid #e0e0e0;
    }

    .schedule-content {
      --background: #fff;
      padding: 0;
    }

    .schedule-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 16px;
    }

    .schedule-card {
      background: #f5f5f5;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.98);
        background: #e8e8e8;
      }
    }

    .schedule-icon {
      font-size: 32px;
      color: #ff9500;
      display: block;
      margin-bottom: 6px;
    }

    .schedule-title {
      font-size: 12px;
      font-weight: 600;
      color: #333;
      margin: 0 0 2px 0;
      line-height: 1.2;
    }

    .schedule-time {
      font-size: 11px;
      color: #666;
      margin: 0;
    }

    .schedule-date {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    .custom-schedule-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .date-input,
    .time-input {
      --padding-start: 12px;
      --padding-end: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .button-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 4px;
    }

    ion-button {
      --padding-top: 8px;
      --padding-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
    }
  `]
})
export class ScheduleMailModalComponent implements OnInit {
  scheduleOptions: ScheduleOption[] = [
    {
      id: 'morning',
      title: 'Sáng mai',
      icon: 'sunny',
      time: '8:00',
      date: '20 thg 11'
    },
    {
      id: 'afternoon',
      title: 'Chiều nay',
      icon: 'sunny',
      time: '13:00',
      date: '19 thg 11'
    },
    {
      id: 'morning-after',
      title: 'Sáng thứ hai',
      icon: 'calendar',
      time: '8:00',
      date: '24 thg 11'
    },
    {
      id: 'custom-time',
      title: 'Chọn ngày\nvà thời gian',
      icon: 'calendar',
      time: '',
      date: ''
    }
  ];

  customDate: string = '';
  customTime: string = '';
  showCustomSchedule: boolean = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Set default values for tomorrow morning
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.customDate = tomorrow.toISOString().split('T')[0];
    this.customTime = '08:00';
  }

  selectSchedule(option: ScheduleOption) {
    if (option.id === 'custom-time') {
      // Show custom schedule form
      this.showCustomSchedule = true;
      return;
    }

    this.modalCtrl.dismiss({
      scheduleType: option.id,
      time: option.time,
      date: option.date
    });
  }

  backToSchedule() {
    this.showCustomSchedule = false;
  }

  confirmCustomSchedule() {
    if (this.customDate && this.customTime) {
      this.modalCtrl.dismiss({
        scheduleType: 'custom',
        date: this.customDate,
        time: this.customTime
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
