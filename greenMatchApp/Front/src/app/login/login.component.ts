import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthResponse, AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<'login' | 'register' | 'reset'>(this.initialMode());
  readonly feedback = signal<AuthResponse | null>(null);
  readonly isLoading = signal(false);

  readonly loginForm = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  readonly registerForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.matchControl('password', 'confirmPassword') }
  );

  readonly resetForm = this.fb.group({
    identifier: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly demoCredentials = computed(() => ({
    username: 'greenfriend',
    password: 'Green123!'
  }));

  setMode(next: 'login' | 'register' | 'reset'): void {
    this.mode.set(next);
    this.feedback.set(null);
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const { identifier, password } = this.loginForm.value;
    const result = this.auth.login(identifier ?? '', password ?? '');
    this.handleAuthResult(result, () => this.postAuthNavigation());
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const { name, email, username, password } = this.registerForm.value;
    const result = this.auth.register({
      name: name ?? '',
      email: email ?? '',
      username: username ?? '',
      password: password ?? ''
    });
    this.handleAuthResult(result, () => this.postAuthNavigation());
  }

  submitReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const { identifier, newPassword } = this.resetForm.value;
    const result = this.auth.resetPassword(identifier ?? '', newPassword ?? '');
    this.handleAuthResult(result, () => this.setMode('login'));
    if (result.ok) {
      this.resetForm.reset();
    }
  }

  private postAuthNavigation(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    void this.router.navigate([redirect || '/chat']);
  }

  private handleAuthResult(result: AuthResponse, onSuccess: () => void): void {
    this.feedback.set(result);
    this.isLoading.set(false);
    if (result.ok) {
      onSuccess();
    }
  }

  private initialMode(): 'login' | 'register' | 'reset' {
    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    if (modeParam === 'register' || modeParam === 'reset') {
      return modeParam;
    }
    return 'login';
  }

  private matchControl(primary: string, confirm: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const primaryControl = group.get(primary);
      const confirmControl = group.get(confirm);
      if (!primaryControl || !confirmControl) {
        return null;
      }
      const mismatch = (primaryControl.value ?? '') !== (confirmControl.value ?? '');
      if (mismatch) {
        confirmControl.setErrors({ ...(confirmControl.errors ?? {}), mismatch: true });
        return { mismatch: true };
      }

      if (confirmControl.hasError('mismatch')) {
        const { mismatch: _removed, ...rest } = confirmControl.errors ?? {};
        confirmControl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    };
  }
}
