export type SidebarNavIcon = 'projects' | 'documents' | 'indicators' | 'export' | 'settings';

export interface SidebarNavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: SidebarNavIcon;
  readonly path?: string;
  readonly badge?: number;
  readonly attention?: boolean;
}
