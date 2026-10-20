import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'new-project',
    loadComponent: () =>
      import('./components/project-setup-wizard-page/project-setup-wizard-page').then(
        (m) => m.ProjectSetupWizardPage,
      ),
  },
  {
    path: 'project/:projectId/indicators',
    loadComponent: () =>
      import('./components/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  { path: '**', redirectTo: 'login' },
];
