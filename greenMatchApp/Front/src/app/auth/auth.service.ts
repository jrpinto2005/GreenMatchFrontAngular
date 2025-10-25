import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  createdAt: number;
}

export interface AuthResponse {
  ok: boolean;
  message: string;
}

interface LoginResult extends AuthResponse {
  user?: AuthUser;
}

interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

const DEFAULT_USER: AuthUser = {
  id: 'greenmatch-demo',
  name: 'Maranta Demo',
  email: 'demo@greenmatch.app',
  username: 'greenfriend',
  password: 'Green123!',
  createdAt: Date.now()
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'gm_users';
  private readonly sessionKey = 'gm_session';
  private readonly currentUserSignal = signal<AuthUser | null>(this.loadSession());

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.ensureSeedUser();
  }

  login(identifier: string, password: string): LoginResult {
    const normalized = identifier.trim().toLowerCase();
    const users = this.loadUsers();
    const user = users.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalized ||
        candidate.username.toLowerCase() === normalized
    );

    if (!user) {
      return { ok: false, message: 'No encontramos una cuenta con esos datos.' };
    }

    if (user.password !== password) {
      return { ok: false, message: 'La contrasena no coincide.' };
    }

    this.persistSession(user);
    return { ok: true, message: `Hola ${user.name}`, user };
  }

  register(payload: RegisterPayload): LoginResult {
    const users = this.loadUsers();
    const duplicateEmail = users.some(
      (user) => user.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      return { ok: false, message: 'Ese correo ya esta en uso.' };
    }

    const duplicateUsername = users.some(
      (user) => user.username.toLowerCase() === payload.username.trim().toLowerCase()
    );

    if (duplicateUsername) {
      return { ok: false, message: 'El usuario ya esta registrado.' };
    }

    const newUser: AuthUser = {
      id: this.randomId(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      username: payload.username.trim().toLowerCase(),
      password: payload.password,
      createdAt: Date.now()
    };

    users.push(newUser);
    this.persistUsers(users);
    this.persistSession(newUser);

    return { ok: true, message: 'Cuenta creada con exito', user: newUser };
  }

  resetPassword(identifier: string, newPassword: string): AuthResponse {
    const users = this.loadUsers();
    const normalized = identifier.trim().toLowerCase();
    const index = users.findIndex(
      (user) =>
        user.email.toLowerCase() === normalized || user.username.toLowerCase() === normalized
    );

    if (index === -1) {
      return { ok: false, message: 'No encontramos ese usuario.' };
    }

    users[index] = { ...users[index], password: newPassword };
    this.persistUsers(users);

    if (this.currentUserSignal()?.id === users[index].id) {
      this.persistSession(users[index]);
    }

    return { ok: true, message: 'Actualizamos tu contrasena.' };
  }

  logout(): void {
    this.persistSession(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSignal();
  }

  private loadUsers(): AuthUser[] {
    if (typeof window === 'undefined') {
      return [DEFAULT_USER];
    }

    try {
      const stored = localStorage.getItem(this.usersKey);
      if (!stored) {
        return [DEFAULT_USER];
      }
      const parsed = JSON.parse(stored) as AuthUser[];
      return parsed.length > 0 ? parsed : [DEFAULT_USER];
    } catch {
      return [DEFAULT_USER];
    }
  }

  private persistUsers(users: AuthUser[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  private loadSession(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const stored = localStorage.getItem(this.sessionKey);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private persistSession(user: AuthUser | null): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (user) {
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.sessionKey);
    }
    this.currentUserSignal.set(user);
  }

  private ensureSeedUser(): void {
    const users = this.loadUsers();
    const hasSeed = users.some((user) => user.email === DEFAULT_USER.email);
    if (!hasSeed) {
      users.push(DEFAULT_USER);
      this.persistUsers(users);
    }
    if (!this.currentUserSignal() && typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        this.currentUserSignal.set(JSON.parse(stored) as AuthUser);
      }
    }
  }

  private randomId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `gm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

