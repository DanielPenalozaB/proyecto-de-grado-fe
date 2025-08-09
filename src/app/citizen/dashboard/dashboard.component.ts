import { Guide } from '@/app/admin/guides/guides.interface';
import { GuidesService } from '@/app/admin/guides/guides.service';
import { AuthService } from '@/app/auth/auth.service';
import { UserData } from '@/app/shared/ui/user-menu/user-menu.component';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownAlign, DropdownSide } from '@radix-ng/primitives/dropdown-menu';
import { BadgeCheck, Bell, Calculator, ChevronsUpDown, Clock, LayoutGrid, LogOut, LucideAngularModule, Map, ScanEye, Sparkles, User, UserRound } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    LucideAngularModule
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
  readonly Map = Map;
  readonly Home = LayoutGrid;
  readonly Calculator = Calculator;
  readonly Profile = UserRound;

  // Dropdown enums
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

  guides: Guide[] = [];
  loadingGuides = false;

  constructor(
    private readonly authService: AuthService,
    private readonly guidesService: GuidesService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
      });

    this.loadGuides();
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
    // You can navigate to upgrade page or open a modal
    this.router.navigate(['/upgrade']);
  }

  logout(): void {
    this.authService.logout();
  }

  loadGuides(): void {
    this.loadingGuides = true;

    this.guidesService.getGuides().subscribe({
      next: (response) => {
        this.guides = response.data;
        this.loadingGuides = false;
      },
      error: (err) => {
        toast.error('Error al obtener las guías. Por favor, inténtalo de nuevo.');
        this.loadingGuides = false;
        console.error(err);
      }
    });
  }
}
