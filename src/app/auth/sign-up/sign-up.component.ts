import { City } from '@/app/admin/cities/cities.interface';
import { CitiesService } from '@/app/admin/cities/cities.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  registerForm: FormGroup;
  cities: City[] = [];
  isLoading = false;
  isCitiesLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly citiesService: CitiesService,
    private readonly router: Router
  ) {
    this.loadCities();

    this.registerForm = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cityId: [0, [Validators.required, Validators.min(1)]],
      language: ['en', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadCities(): void {
    this.isCitiesLoading = true;
    this.citiesService.getCities({ page: 1, limit: 100 }).pipe(
      finalize(() => this.isCitiesLoading = false)
    ).subscribe({
      next: (cities) => {
        this.cities = cities.data;
        console.log(cities);
        if (cities.data.length > 0) {
          this.registerForm.patchValue({
            cityId: cities.data[0].id
          });
        }
      },
      error: () => {
        toast.error('Failed to load cities');
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, password, cityId, language } = this.registerForm.getRawValue();

    this.authService.register(
      name,
      email,
      password,
      cityId,
      language
    ).subscribe({
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
