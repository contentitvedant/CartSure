import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;
  authForm: FormGroup;
  returnUrl: string = '/';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null;
    this.showPassword = false;
    this.authForm.reset();
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.authForm.value;

    const authObservable = this.isLoginMode
      ? this.authService.login(email, password)
      : this.authService.signup(email, password);

    authObservable.subscribe({
      next: () => {
        this.isLoading = false;
        alert(this.isLoginMode ? 'Login successfully! ✅' : 'Registration successful! ✅');
        this.router.navigateByUrl(this.returnUrl); // Redirect to returnUrl or home
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.message || 'An error occurred during authentication.';
        if (!this.isLoginMode && err.code === 'auth/email-already-in-use') {
          // Set specific form error for existing email
          this.authForm.get('email')?.setErrors({ emailInUse: true });
          this.errorMessage = 'An account already exists with this email address.';
        } else {
          this.errorMessage = errorMessage;
        }
      }
    });
  }
}
