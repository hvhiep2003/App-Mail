import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraftMailPage } from './draft-mail.page';

describe('DraftMailPage', () => {
  let component: DraftMailPage;
  let fixture: ComponentFixture<DraftMailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftMailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
