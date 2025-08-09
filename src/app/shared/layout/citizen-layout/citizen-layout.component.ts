import { AuthService } from '@/app/auth/auth.service';
import { UserData } from '@/app/shared/ui/user-menu/user-menu.component';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DropdownAlign, DropdownSide, RdxDropdownMenuContentDirective, RdxDropdownMenuItemDirective, RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { BadgeCheck, Bell, Calculator, LayoutGrid, LogOut, LucideAngularModule, Map, ScanEye, UserRound } from 'lucide-angular';
import { filter, Subject, takeUntil } from 'rxjs';

interface NavItem {
  route: string;
  icon: any;
  label: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-citizen-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LucideAngularModule,
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective
  ],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20">
      <!-- Top Navbar -->
      <nav class="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between gap-2 px-4 py-3 w-full max-w-4xl mx-auto">
          <!-- Greeting -->
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-gray-900">
              ¡Hola, {{ user?.name?.split(' ')?.[0] }}!
            </h1>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-2">
            <button
              class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg outline-none ring-2 ring-transparent transition-all hover:bg-gray-100 focus-visible:ring-blue-500 data-[state=open]:bg-gray-100"
              [rdxDropdownMenuTrigger]="userMenu"
              [side]="DropdownSide.Bottom"
              [align]="DropdownAlign.End"
              [sideOffset]="8"
            >
              <!-- Avatar -->
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
                @if (user?.avatar) {
                  <img [src]="user?.avatar" [alt]="user?.name" class="h-8 w-8 rounded-full object-cover">
                } @else {
                  {{ getInitials(user?.name || '') }}
                }
              </div>
            </button>

            <!-- User Dropdown Menu -->
            <ng-template #userMenu>
              <div
                class="z-50 min-w-56 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden rounded-lg border bg-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                rdxDropdownMenuContent
              >
                <!-- User info header -->
                <div class="p-0 font-normal">
                  <div class="flex items-center gap-3 px-3 py-3 text-left text-sm border-b border-gray-100">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
                      @if (user?.avatar) {
                        <img [src]="user?.avatar" [alt]="user?.name" class="h-10 w-10 rounded-full object-cover">
                      } @else {
                        {{ getInitials(user?.name || '') }}
                      }
                    </div>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold text-gray-900">{{ user?.name || 'User' }}</span>
                      <span class="truncate text-xs text-gray-500">{{ user?.email || '' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Main menu items -->
                <div class="p-1">
                  <button
                    class="group relative flex w-full items-center rounded-md outline-none px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    rdxDropdownMenuItem
                    (click)="navigateTo('/settings/account')"
                  >
                    <lucide-angular [img]="BadgeCheck" size="16" class="mr-3 text-gray-500" />
                    Perfil
                  </button>

                  <button
                    class="group relative flex w-full items-center rounded-md outline-none px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    rdxDropdownMenuItem
                    (click)="navigateTo('/settings/notifications')"
                  >
                    <lucide-angular [img]="Bell" size="16" class="mr-3 text-gray-500" />
                    Notificaciones
                  </button>

                  @if (user?.role === 'admin') {
                    <button
                      class="group relative flex w-full items-center rounded-md outline-none px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      rdxDropdownMenuItem
                      (click)="navigateTo('/admin')"
                    >
                      <lucide-angular [img]="ScanEye" size="16" class="mr-3 text-gray-500" />
                      Vista de administrador
                    </button>
                  }
                </div>

                <!-- Separator -->
                <div class="h-px bg-gray-200 mx-2"></div>

                <!-- Logout -->
                <div class="p-1">
                  <button
                    class="group relative flex w-full items-center rounded-md outline-none px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    rdxDropdownMenuItem
                    (click)="logout()"
                  >
                    <lucide-angular [img]="LogOut" size="16" class="mr-3" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="w-full" [class.max-w-4xl]="!isMapRoute" [class.mx-auto]="!isMapRoute">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[400]">
        <div class="flex items-center gap-2 p-2 rounded-2xl bg-white border border-gray-200 shadow-lg">
          @for (navItem of navigationItems; track navItem.route) {
            <button
              class="flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
              [class.hover:bg-gray-100]="!navItem.isActive"
              [class.bg-teal-100]="navItem.isActive"
              [class.bg-transparent]="!navItem.isActive"
              (click)="navigateTo(navItem.route)"
            >
              <lucide-angular
                [img]="navItem.icon"
                size="20"
                [class.text-teal-600]="navItem.isActive"
                [class.text-gray-500]="!navItem.isActive"
              />
              <span
                class="text-xs font-medium"
                [class.text-teal-600]="navItem.isActive"
                [class.text-gray-500]="!navItem.isActive"
              >
                {{ navItem.label }}
              </span>
            </button>
          }
        </div>
      </nav>
    </div>
  `,
  styles: [`
    /* Ensure smooth transitions for navigation */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    /* Custom scrollbar for dropdown if needed */
    [rdxDropdownMenuContent]::-webkit-scrollbar {
      width: 6px;
    }

    [rdxDropdownMenuContent]::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    [rdxDropdownMenuContent]::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    [rdxDropdownMenuContent]::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class CitizenLayoutComponent implements OnInit, OnDestroy {
  user: UserData | null = null;
  isMapRoute = false;
  navigationItems: NavItem[] = [
    { route: '/map', icon: Map, label: 'Mapa' },
    { route: '/', icon: LayoutGrid, label: 'Inicio' },
    { route: '/calculator', icon: Calculator, label: 'Calc' },
    { route: '/profile', icon: UserRound, label: 'Perfil' }
  ];

  private readonly destroy$ = new Subject<void>();

  // Icons
  readonly BadgeCheck = BadgeCheck;
  readonly Bell = Bell;
  readonly LogOut = LogOut;
  readonly ScanEye = ScanEye;

  // Dropdown enums
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
      });

    // Subscribe to route changes to update active navigation
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveNavigation(event.url);
      });

    // Set initial active navigation
    this.updateActiveNavigation(this.router.url);
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

  logout(): void {
    this.authService.logout();
  }

  private updateActiveNavigation(currentUrl: string): void {
    // Check if current route is the map route
    this.isMapRoute = currentUrl === '/map';

    // Update active navigation items
    this.navigationItems = this.navigationItems.map(item => ({
      ...item,
      isActive: currentUrl === item.route || (item.route === '/' && currentUrl === '')
    }));
  }
}