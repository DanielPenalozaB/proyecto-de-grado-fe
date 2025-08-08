import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookOpenText, ChevronRight, Droplets, LayoutDashboard, LibraryBig, LucideAngularModule, Map, Menu, MessageCircleQuestion, User, X } from 'lucide-angular';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { SidebarLink } from './sidebar.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, UserMenuComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() appLogoUrl = '/assets/logo.png';
  @Input() appName = 'My App';

  isSidebarOpen = true;
  isMobileView = false;
  readonly Droplets = Droplets;
  readonly X = X;

  // Store icons as component properties
  icons = {
    LayoutDashboard,
    User,
    Map,
    BookOpenText,
    LibraryBig,
    MessageCircleQuestion,
    Menu,
    ChevronRight
  };

  links: SidebarLink[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      url: '/admin',
    },
    {
      icon: User,
      label: 'Usuarios',
      url: '/admin/users',
    },
    {
      icon: Map,
      label: 'Ciudades',
      url: '/admin/cities',
    },
    {
      icon: BookOpenText,
      label: 'Guías',
      url: '/admin/guides',
    },
    {
      icon: LibraryBig,
      label: 'Módulos',
      url: '/admin/modules',
    },
    {
      icon: MessageCircleQuestion,
      label: 'Preguntas',
      url: '/admin/questions',
    },
  ];

  toggleSidebar(event?: Event) {
    if (event && event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSubMenu(link: SidebarLink, event?: Event) {
    if (event && event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    if (link.children) {
      link.isExpanded = !link.isExpanded;
    }
  }

  checkActiveLink(link: SidebarLink): boolean {
    return link.isActive || false;
  }

  ngOnInit() {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
  }

  checkViewport() {
    this.isMobileView = window.innerWidth < 768;
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }
}