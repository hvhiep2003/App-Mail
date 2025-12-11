import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComposeMailPage } from './compose-mail.page';

describe('ComposeMailPage', () => {
  let component: ComposeMailPage;
  let fixture: ComponentFixture<ComposeMailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComposeMailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
