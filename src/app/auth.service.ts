import { Injectable } from '@angular/core';

export interface AuthUser {
  user_id: number;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: AuthUser | null = null;

  hydrate(): void {
    try {
      const raw = localStorage.getItem('materialhub_user');
      this._user = raw ? JSON.parse(raw) : null;
    } catch {
      this._user = null;
    }
  }

  login(u: AuthUser): void {
    this._user = u;
    localStorage.setItem('materialhub_user', JSON.stringify(u));
  }

  logout(): void {
    this._user = null;
    localStorage.removeItem('materialhub_user');
  }

  isLoggedIn(): boolean {
    return !!this._user;
  }

  user(): AuthUser | null {
    return this._user;
  }
}
