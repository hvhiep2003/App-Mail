import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'mailbox',
    loadComponent: () => import('./pages/mailbox/mailbox.page').then(m => m.MailboxPage)
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account/account.page').then(m => m.AccountPage)
  },
  {
    path: 'add-user',
    loadComponent: () =>
      import('./pages/add-user/add-user.page').then(m => m.AddUserPage)
  },
  {
    path: 'account-info/:id',
    loadComponent: () => import('./pages/account-info/account-info.page').then(m => m.AccountInfoPage)
  },
  {
    path: 'email-detail/:id',
    loadComponent: () => import('./pages/email-detail/email-detail.page').then(m => m.EmailDetailPage)
  },

  {
    path: 'compose',
    loadComponent: () => import('./pages/compose-mail/compose-mail.page').then(m => m.ComposeMailPage)
  },
  {
    path: 'draft-mail',
    loadComponent: () => import('./pages/draft-mail/draft-mail.page').then(m => m.DraftMailPage)
  },
  {
    path: 'all-mail',
    loadComponent: () => import('./pages/all-mail/all-mail.page').then(m => m.AllMailPage)
  },
  {
    path: 'sent-mail',
    loadComponent: () => import('./pages/sent-mail/sent-mail.page').then(m => m.SentMailPage)
  },
  {
    path: 'inbox',
    loadComponent: () => import('./pages/inbox/inbox.page').then(m => m.InboxPage)
  },
  {
    path: 'trash-mail',
    loadComponent: () => import('./pages/trash-mail/trash-mail.page').then(m => m.TrashMailPage)
  },
  {
    path: 'spam-mail',
    loadComponent: () => import('./pages/spam-mail/spam-mail.page').then(m => m.SpamMailPage)
  },
  {
    path: 'star-mail',
    loadComponent: () => import('./pages/star-mail/star-mail.page').then(m => m.StarMailPage)
  },
  {
    path: 'scheduled-mail',
    loadComponent: () => import('./pages/scheduled-mail/scheduled-mail.page').then(m => m.ScheduledMailPage)
  }

];
