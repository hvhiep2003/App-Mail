import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailDetailPage } from './email-detail.page';

describe('EmailDetailPage', () => {
  let component: EmailDetailPage;
  let fixture: ComponentFixture<EmailDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
