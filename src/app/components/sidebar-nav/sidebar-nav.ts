import { NgTemplateOutlet } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarNavItem } from '../../models/sidebar-nav-item.model';

@Component({
  selector: 'app-sidebar-nav',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  host: {
    class: 'bg-surface border-outline-variant flex h-dvh w-60 shrink-0 flex-col border-r',
  },
  templateUrl: './sidebar-nav.html',
})
export class SidebarNav {
  protected readonly navItems: readonly SidebarNavItem[] = [
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'documents', label: 'Documents', icon: 'documents', badge: 24 },
    {
      id: 'indicators',
      label: 'Indicators',
      icon: 'indicators',
      path: '/dashboard',
      attention: true,
    },
    { id: 'export', label: 'Export & Synthesis', icon: 'export' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  protected readonly userName = 'Prof. Radu Vasile';
  protected readonly userRole = 'QA Director · UPT';

  protected readonly initials = computed(() =>
    this.userName
      .split(/\s+/)
      .filter((part) => /\p{L}/u.test(part))
      .slice(-2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
  );
}
