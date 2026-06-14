import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app-layout">
      <!-- Side Navigation Bar for Logged-In Users -->
      <aside class="sidebar" *ngIf="authService.isAuthenticated()">
        <div class="sidebar-logo">
          <span class="logo-accent">NEC</span> Voice
        </div>
        
        <!-- Theme Toggle Button -->
        <button class="btn-theme-toggle" (click)="toggleTheme()">
          <span class="material-icons">{{ isLightTheme ? 'dark_mode' : 'light_mode' }}</span>
          <span>{{ isLightTheme ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
        
        <nav class="sidebar-nav">
          <a routerLink="/voice" routerLinkActive="active-route" class="nav-item">
            <span class="material-icons">mic</span>
            <span>Voice Agent</span>
          </a>
          <a routerLink="/dashboard" routerLinkActive="active-route" class="nav-item">
            <span class="material-icons">dashboard</span>
            <span>Dashboard</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <span class="material-icons user-avatar">account_circle</span>
            <div class="details">
              <span class="username">{{ authService.currentUser()?.username }}</span>
              <span class="role">User</span>
            </div>
          </div>
          <button class="btn-logout" (click)="authService.logout()">
            <span class="material-icons">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Router Container -->
      <main class="main-content" [class.no-sidebar]="!authService.isAuthenticated()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
    }

    .sidebar {
      width: 260px;
      background: #0d111a;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      box-sizing: border-box;
      z-index: 100;
    }

    .sidebar-logo {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      padding-left: 0.5rem;
    }

    .logo-accent {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .btn-theme-toggle {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #9ca3af;
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
      transition: all 0.2s;
      width: 100%;
    }

    .btn-theme-toggle:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-grow: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #9ca3af;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.03);
      color: white;
    }

    .nav-item.active-route {
      background: linear-gradient(135deg, rgba(157, 34, 124, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%);
      border: 1px solid rgba(157, 34, 124, 0.2);
      color: var(--color-primary);
    }

    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 0.5rem;
    }

    .user-avatar {
      font-size: 2.25rem;
      color: #9ca3af;
    }

    .details {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .role {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.6rem;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .main-content {
      flex-grow: 1;
      min-width: 0;
      position: relative;
    }

    .main-content.no-sidebar {
      width: 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  isLightTheme = false;

  constructor(
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        this.isLightTheme = true;
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isLightTheme) {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
      }
    }
  }
}
