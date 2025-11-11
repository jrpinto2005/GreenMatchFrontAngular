import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  ok: boolean;
  message: string;
  user_id?: number;
  token?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Login con username o email + password
   * POST /auth/login
   */
  login(identifier: string, password: string): Observable<AuthResponse> {
    const body = { identifier, password };
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, body)
      .pipe(tap(res => this.handleAuthSideEffects(res)));
  }

  /**
   * Registro de usuario
   * POST /auth/register
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, payload)
      .pipe(tap(res => this.handleAuthSideEffects(res)));
  }

  /**
   * Reset de contraseña
   * POST /auth/reset
   */
  resetPassword(identifier: string, newPassword: string): Observable<AuthResponse> {
    const body = { identifier, new_password: newPassword };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/reset`, body);
  }

  /**
   * Guardar token/user_id en localStorage (muy simple por ahora)
   */
  private handleAuthSideEffects(res: AuthResponse): void {
    if (!res.ok) {
      return;
    }
    if (res.token) {
      localStorage.setItem('auth_token', res.token);
    }
    if (res.user_id != null) {
      localStorage.setItem('user_id', String(res.user_id));
    }
  }

  /**
   * Helpers opcionales para el resto de la app
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserId(): number | null {
    const raw = localStorage.getItem('user_id');
    return raw ? Number(raw) : null;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  }
  isAuthenticated(): boolean {
  const token = this.getToken();
  // Si existe token, asumimos que está autenticado (por ahora sin verificar JWT)
  return !!token;
}

}

