import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-mark-mail-popover',
  template: `
    <ion-list lines="none" class="ion-no-padding popover-list">
      <ion-list-header lines="full" class="popover-list-header">
        <ion-label>Tổng thư</ion-label>
      </ion-list-header>
      
      <ion-item 
        button 
        detail="false" 
        (click)="selectAction('trash')"
        *ngIf="currentFolder !== 'spam' && currentFolder !== 'scheduled'" 
      >
        <ion-label>Di chuyển vào thư rác</ion-label>
        <ion-icon slot="end" name="trash-outline"></ion-icon>
      </ion-item>
      
      <ion-item 
        button 
        detail="false" 
        (click)="selectAction('readUnread')"
        *ngIf="currentFolder !== 'scheduled'" 
      >
        <ion-label>Đánh dấu đã/chưa đọc</ion-label>
        <ion-icon slot="end" name="mail-open-outline"></ion-icon>
      </ion-item>
      
      <ion-item button detail="false" (click)="selectAction('flag')">
        <ion-label>{{ currentFolder === 'star' ? 'Bỏ đánh dấu thư' : 'Đánh dấu thư' }}</ion-label>
        <ion-icon slot="end" name="star-outline"></ion-icon>
      </ion-item>
    </ion-list>
  `,
  styleUrls: ['./mark-mail-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MarkMailPopoverComponent implements OnInit {
  @Input() currentFolder: string = 'inbox';

  constructor(private popoverController: PopoverController) { }

  ngOnInit() { }

  selectAction(action: string) {
    this.popoverController.dismiss({ action: action });
  }
}