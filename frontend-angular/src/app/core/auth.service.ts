import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface UserProfile {
  username: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `http://${window.location.hostname}:8080/api/auth`;

  // Signals
  public currentUser = signal<UserProfile | null>(null);
  public isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  public register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      tap(res => this.saveSession(res))
    );
  }

  public login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.saveSession(res))
    );
  }

  public logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(response: any) {
    if (response && response.token) {
      localStorage.setItem('access_token', response.token);
      
      const profile: UserProfile = {
        username: response.username,
        email: response.email,
        roles: response.roles || []
      };
      
      localStorage.setItem('user_profile', JSON.stringify(profile));
      this.currentUser.set(profile);
    }
  }

  private restoreSession() {
    const token = localStorage.getItem('access_token');
    const profileJson = localStorage.getItem('user_profile');
    
    if (token && profileJson) {
      try {
        const profile = JSON.parse(profileJson);
        this.currentUser.set(profile);
      } catch (e) {
        this.logout();
      }
    }
  }
}
