import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="glow-orb"></div>
      
      <div class="glass-panel auth-card">
        <div class="logo" routerLink="/landing">
          <img class="college-logo" src="https://www.nrtec.in/wp-content/uploads/2017/03/NEClogo.png" alt="NEC College Logo">
          <span class="logo-text"><span class="logo-accent">NEC</span> Assistant</span>
        </div>
        
        <h2>{{ isRegisterMode ? 'Create Account' : 'Welcome Back' }}</h2>
        <p class="subtitle">{{ isRegisterMode ? 'Register to start real-time voice sessions' : 'Enter credentials to access your console' }}</p>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <!-- Alert error banner -->
          <div *ngIf="errorMessage" class="error-banner">
            <span class="material-icons">error_outline</span>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="form-group" *ngIf="isRegisterMode">
            <label for="email">Email Address</label>
            <input type="email" id="email" formControlName="email" placeholder="you@enterprise.com">
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" formControlName="username" placeholder="johndoe">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" formControlName="password" placeholder="••••••••">
          </div>

          <button type="submit" class="btn btn-submit" [disabled]="authForm.invalid || loading">
            <span *ngIf="loading" class="spinner"></span>
            <span>{{ isRegisterMode ? 'Sign Up' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="auth-toggle">
          <span>{{ isRegisterMode ? 'Already have an account?' : "Don't have an account?" }}</span>
          <a [routerLink]="isRegisterMode ? '/login' : '/register'">
            {{ isRegisterMode ? 'Sign In' : 'Sign Up' }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(10, 12, 16, 0.72) 0%, rgba(6, 8, 14, 0.82) 100%), 
                  url('https://www.nrtec.in/wp-content/uploads/2023/06/DJI_0292.jpg') no-repeat center center fixed;
      background-size: cover;
      position: relative;
      overflow: hidden;
      padding: 1rem;
    }

    .glow-orb {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: rgba(157, 34, 124, 0.1);
      filter: blur(150px);
      z-index: 0;
      pointer-events: none;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 3rem;
      z-index: 10;
      box-sizing: border-box;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      cursor: pointer;
    }

    .college-logo {
      height: 38px;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2)) brightness(1.1);
    }

    .logo-text {
      color: var(--text-main);
    }

    .logo-accent {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      text-align: center;
    }

    .subtitle {
      color: #9ca3af;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 0.5rem;
      margin-bottom: 2rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #9ca3af;
    }

    input {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: white;
      font-family: inherit;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    input:focus {
      outline: none;
      border-color: var(--color-primary);
      background: rgba(186, 104, 200, 0.02);
      box-shadow: 0 0 10px rgba(186, 104, 200, 0.15);
    }

    .btn-submit {
      margin-top: 1rem;
      background: var(--primary-gradient);
      color: white;
      border: none;
      padding: 0.85rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(157, 34, 124, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .auth-toggle {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.85rem;
      color: #9ca3af;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .auth-toggle a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
    }

    .error-banner {
      background: rgba(239, 44, 44, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #f87171;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }

    /* Light Theme Styling Overrides for Auth Card */
    body.light-theme .auth-container {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(241, 245, 249, 0.82) 100%), 
                  url('https://www.nrtec.in/wp-content/uploads/2023/06/DJI_0292.jpg') no-repeat center center fixed !important;
      background-size: cover !important;
    }

    body.light-theme .logo-text,
    :host-context(body.light-theme) .logo-text {
      color: #0f172a !important;
    }

    body.light-theme input {
      background: #ffffff !important;
      border: 1px solid rgba(15, 23, 42, 0.12) !important;
      color: #0f172a !important;
    }

    body.light-theme input:focus {
      border-color: var(--color-primary) !important;
      box-shadow: 0 0 10px rgba(157, 34, 124, 0.1) !important;
    }

    body.light-theme label {
      color: #475569 !important;
    }

    body.light-theme h2 {
      color: #0f172a !important;
    }

    body.light-theme .subtitle {
      color: #475569 !important;
    }

    body.light-theme .auth-toggle {
      color: #475569 !important;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AuthComponent implements OnInit {
  public isRegisterMode = false;
  public authForm!: FormGroup;
  public loading = false;
  public errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.isRegisterMode = url[0]?.path === 'register';
      this.initForm();
    });
  }

  private initForm() {
    this.authForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    if (this.isRegisterMode) {
      this.authForm.addControl('email', new FormControl('', [Validators.required, Validators.email]));
    }
  }

  public onSubmit() {
    if (this.authForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const payload = this.authForm.value;
    const authObs = this.isRegisterMode
      ? this.authService.register(payload)
      : this.authService.login(payload);

    authObs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/voice']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please verify credentials.';
      }
    });
  }
}
