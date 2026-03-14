
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';
import { UserLoginModel } from '../../models/user-login.model';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, PasswordModule, CardModule],
  templateUrl: './user-login-component.html',
  styleUrl: './user-login-component.scss',
})
export class UserLoginComponent {
  private userService = inject(UserService);
  private cartService = inject(CartService);
  private router = inject(Router);

  user: UserLoginModel = new UserLoginModel();
  errorMessage = signal<string>('');
  loading = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    
    this.userService.login(this.user).subscribe({
      next: () => {
        this.loading.set(false);
        this.cartService.clearAllDrafts();
        const currentUser = this.userService.currentUser();
        if (currentUser?.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error || 'התחברות נכשלה');
      }
    });
  }

  loginAsAdmin(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    
    this.userService.login(this.user).subscribe({
      next: () => {
        const currentUser = this.userService.currentUser();
        if (currentUser?.role === 'Admin') {
          this.loading.set(false);
          this.cartService.clearAllDrafts();
          this.router.navigate(['/admin']);
        } else {
          this.loading.set(false);
          this.userService.logout();
          this.errorMessage.set('אין לך הרשאות מנהל. רק מנהלים יכולים להתחבר דרך כפתור זה.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error || 'התחברות נכשלה');
      }
    });
  }
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}