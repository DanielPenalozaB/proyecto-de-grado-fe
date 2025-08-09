import { AuthService } from '@/app/auth/auth.service';
import { UserData } from '@/app/shared/ui/user-menu/user-menu.component';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BadgeCheck, LucideAngularModule, Trophy } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserData | null = null;

  private readonly destroy$ = new Subject<void>();

  // Icons
  readonly BadgeCheck = BadgeCheck;
  readonly Trophy = Trophy;

  constructor(
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    // Subscribe to current user
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
}
