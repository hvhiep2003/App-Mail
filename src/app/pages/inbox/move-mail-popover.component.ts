import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-move-mail-popover',
  template: `
    <ion-list lines="none" class="ion-no-padding popover-list">
      
      <ion-item 
        button 
        detail="false" 
        (click)="selectFolder('all')"
        [disabled]="currentFolder === 'all'" 
        [class.is-current-folder]="currentFolder === 'all'"
      >
        <ion-label>Tất cả thư</ion-label>
        <ion-icon slot="end" name="file-tray-full-outline"></ion-icon>
      </ion-item>
      
      <ion-item 
        button 
        detail="false" 
        (click)="selectFolder('inbox')"
        [disabled]="currentFolder === 'inbox'" 
        [class.is-current-folder] = "currentFolder === 'inbox'"
      >
        <ion-label>Hộp thư đến</ion-label>
        <ion-icon 
          slot="end" 
          name="mail-outline"
        ></ion-icon>
      </ion-item>
      
      <ion-item 
        button 
        detail="false" 
        (click)="selectFolder('sent')"
        [disabled]="currentFolder === 'sent'" 
        [class.is-current-folder] = "currentFolder === 'sent'"
        *ngIf="currentFolder !== 'scheduled'"
      >
        <ion-label>Đã gửi</ion-label>
        <ion-icon slot="end" name="send-outline"></ion-icon>
      </ion-item>
      
      <ion-item button detail="false" (click)="selectFolder('drafts')">
        <ion-label>Thư nháp</ion-label>
        <ion-icon slot="end" name="mail-open-outline"></ion-icon>
      </ion-item>

      <ion-item 
        button 
        detail="false" 
        (click)="selectFolder('spam')"
        [disabled]="currentFolder === 'spam'" 
        [class.is-current-folder] = "currentFolder === 'spam'"
      >
        <ion-label>Thư rác</ion-label>
        <ion-icon slot="end" name="bug-outline"></ion-icon>
      </ion-item>

      <ion-item 
        button 
        detail="false" 
        (click)="selectFolder('trash')"
        [disabled]="currentFolder === 'trash'" 
        [class.is-current-folder] = "currentFolder === 'trash'"
      >
        <ion-label>Thùng rác</ion-label>
        <ion-icon slot="end" name="trash-outline"></ion-icon>
      </ion-item>
    </ion-list>
  `,
  styleUrls: ['./move-mail-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MoveMailPopoverComponent implements OnInit {
  @Input() currentFolder: string = 'inbox'; 
  
  constructor(private popoverController: PopoverController) {}
  
  ngOnInit() {}

  selectFolder(folder: string) {
    this.popoverController.dismiss({ folder: folder });
  }
}