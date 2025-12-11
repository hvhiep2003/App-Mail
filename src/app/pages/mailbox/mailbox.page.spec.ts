import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MailboxPage } from './mailbox.page';

describe('MailboxPage', () => {
  let component: MailboxPage;
  let fixture: ComponentFixture<MailboxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
