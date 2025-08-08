import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-confirm-email',
  imports: [],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.confirmEmail();
  }

  confirmEmail(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.errorMessage = 'Invalid confirmation link';
      this.isLoading = false;
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/confirm-email`, { token })
      .subscribe({
        next: () => {
          this.isSuccess = true;
          this.isLoading = false;
          toast.success('Email confirmed successfully!');
          toast.loading('Redirecting...');
          setTimeout(() => {
            this.router.navigate(['/auth/sign-in']);
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error.message;
          toast.error(err.error.message || 'Error confirming email. Please try again.');
        }
      });
  }
}