import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  DropdownAlign,
  DropdownSide,
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective,
  RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  LucideAngularModule,
  ScanEye,
  Sparkles,
  User
} from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

export interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective
  ],
  template: `
    <div class="flex items-center gap-2 px-2 py-1.5">
      <div class="relative w-full">
        <!-- Custom trigger button that matches Shadcn design -->
        <button
          class="flex h-10 w-full items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-left outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          [rdxDropdownMenuTrigger]="userMenu"
          [side]="isMobile ? DropdownSide.Bottom : DropdownSide.Right"
          [align]="DropdownAlign.End"
          [sideOffset]="4"
        >
          <!-- Avatar -->
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
            @if (user?.avatar) {
              <img [src]="user?.avatar ?? ''" [alt]="user?.name" class="h-8 w-8 rounded-full object-cover">
            } @else {
              {{ getInitials(user?.name || '') }}
            }
          </div>

          <!-- User info -->
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{ user?.name || 'User' }}</span>
            <span class="truncate text-xs text-gray-500">{{ user?.email || '' }}</span>
          </div>

          <!-- Chevron -->
          <lucide-angular [img]="ChevronsUpDown" class="ml-auto size-4" />
        </button>

        <!-- Dropdown menu template -->
        <ng-template #userMenu>
          <div
            class="z-50 min-w-56 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden rounded-lg border bg-white shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]"
            rdxDropdownMenuContent
          >
            <!-- User info header -->
            <div class="p-0 font-normal">
              <div class="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                  @if (user?.avatar) {
                    <img [src]="user?.avatar ?? ''" [alt]="user?.name" class="h-8 w-8 rounded-lg object-cover">
                  } @else {
                    {{ getInitials(user?.name || '') }}
                  }
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ user?.name || 'User' }}</span>
                  <span class="truncate text-xs text-gray-500">{{ user?.email || '' }}</span>
                </div>
              </div>
            </div>

            <!-- Separator -->
            <div class="h-px bg-gray-200"></div>

            <!-- Main menu items -->
            <div class=" p-1">
              <button
                class="group relative flex w-full items-center rounded outline-none px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
                rdxDropdownMenuItem
                (click)="navigateTo('/settings/account')"
              >
                <span class="mr-2">
                  <lucide-angular [img]="BadgeCheck" size="14" />
                </span>
                Perfil
              </button>

              <button
                class="group relative flex w-full items-center rounded outline-none px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
                rdxDropdownMenuItem
                (click)="navigateTo('/settings/notifications')"
              >
                <span class="mr-2">
                  <lucide-angular [img]="Bell" size="14" />
                </span>
                Notificaciones
              </button>

              <button
                class="group relative flex w-full items-center rounded outline-none px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
                rdxDropdownMenuItem
                (click)="navigateTo('/')"
              >
                <span class="mr-2">
                  <lucide-angular [img]="ScanEye" size="14" />
                </span>
                Vista de ciudadano
              </button>
            </div>

            <!-- Separator -->
            <div class="h-px bg-gray-200"></div>

            <!-- Logout -->
            <div class="p-1">
              <button
                class="group relative flex w-full items-center rounded outline-none px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
                rdxDropdownMenuItem
                (click)="logout()"
              >
                <span class="mr-2">
                  <lucide-angular [img]="LogOut" size="14" />
                </span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit, OnDestroy {
  @Input() isMobile = false;
  @Input() showUpgrade = true;

  user: UserData | null = null;
  private readonly destroy$ = new Subject<void>();

  // Icons
  readonly ChevronsUpDown = ChevronsUpDown;
  readonly BadgeCheck = BadgeCheck;
  readonly Bell = Bell;
  readonly CreditCard = CreditCard;
  readonly LogOut = LogOut;
  readonly Sparkles = Sparkles;
  readonly User = User;
  readonly ScanEye = ScanEye;

  // Dropdown enums
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

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