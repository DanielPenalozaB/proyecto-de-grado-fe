import { AuthService } from '@/app/auth/auth.service';
import { UserData } from '@/app/shared/ui/user-menu/user-menu.component';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownAlign, DropdownSide, RdxDropdownMenuContentDirective, RdxDropdownMenuItemDirective, RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { BadgeCheck, Bell, ChevronsUpDown, Clock, LogOut, LucideAngularModule, ScanEye, Sparkles, User } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    LucideAngularModule,
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: UserData | null = null;
  private readonly destroy$ = new Subject<void>();

  // Icons
  readonly ChevronsUpDown = ChevronsUpDown;
  readonly BadgeCheck = BadgeCheck;
  readonly Bell = Bell;
  readonly LogOut = LogOut;
  readonly Sparkles = Sparkles;
  readonly User = User;
  readonly ScanEye = ScanEye;
  readonly Clock = Clock;

  // Dropdown enums
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

  readonly guides = [
    {
      id: 1,
      title: 'Introducción',
      link: '/guides/introduction',
      description: 'El mundo de la recolección del agua con el objetivo de una vida sustentable.',
      duration: '15 min',
    }, {
      id: 2,
      title: 'Paso a paso',
      link: '/guides/step-by-step',
      description: 'Aprende paso a paso las distintas metodologías de recolección de agua.',
      duration: '30 min',
    }, {
      id: 3,
      title: 'Guía completa',
      link: '/guides/complete-guide',
      description: 'Aprende paso a paso las distintas metodologías de recolección de agua.',
      duration: '2 horas',
    }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onUpgrade(): void {
    // Handle upgrade logic
    console.log('Upgrade clicked');
    // You can navigate to upgrade page or open a modal
    this.router.navigate(['/upgrade']);
  }

  logout(): void {
    this.authService.logout();
  }
}
