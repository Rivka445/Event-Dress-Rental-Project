
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';
import { UserModel } from '../../models/user.model';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user-update-component',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, PasswordModule, CardModule],
  templateUrl: './user-update-component.html',
  styleUrl: './user-update-component.scss',
})
export class UserUpdateComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  user: UserModel = new UserModel();
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  loading = signal(false);
  formTouched = signal(false);

  isEmailValid(): boolean {
    const email = (this.user.email || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isPhoneValid(): boolean {
    const phone = (this.user.phone || '').replace(/[^0-9]/g, '');
    return /^05\d{8}$/.test(phone);
  }

  isPasswordValid(): boolean {
    const password = (this.user.password || '').trim();
    return password.length >= 6;
  }

  isNameValid(value?: string): boolean {
    return !!value && value.trim().length >= 2;
  }

  private extractValidationMessages(err: any): string[] {
    const errors = err?.error?.errors ?? err?.errors;
    if (!errors || typeof errors !== 'object') {
      return [];
    }

    return Object.values(errors)
      .flat()
      .map((message) => String(message));
  }

  private getErrorMessage(err: any): string {
    const rawMessage = err?.error?.message ?? err?.error ?? err?.message;
    const normalizedMessage = typeof rawMessage === 'string'
      ? rawMessage
      : rawMessage?.message || rawMessage?.error || rawMessage?.title || (Array.isArray(rawMessage) ? rawMessage.join(', ') : '');
    if (normalizedMessage === 'The Token field is required.') {
      return 'שגיאת מערכת בעדכון, נסי שוב בעוד רגע';
    }
    const validationMessages = this.extractValidationMessages(err);
    if (validationMessages.some((message) => message === 'User name already exists')) {
      return 'בחרי שם אחר כי זה כבר קיים';
    }
    if (validationMessages.some((message) => message === 'The Token field is required.')) {
      return 'שגיאת מערכת בעדכון, נסי שוב בעוד רגע';
    }
    if (validationMessages.length > 0) {
      return validationMessages.join(', ');
    }
    if (normalizedMessage?.toLowerCase().includes('validation errors')) {
      return 'בחרי שם אחר כי זה כבר קיים';
    }
    return normalizedMessage || 'העדכון נכשל';
  }

  ngOnInit(): void {
    const currentUser = this.userService.currentUser();
    if (!currentUser) {
      this.alertService.show('יש להתחבר למערכת לפני ההמשך', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.user = { ...currentUser };
  }

  onSubmit(): void {
    this.formTouched.set(true);

    if (!this.isNameValid(this.user.firstName)
      || !this.isNameValid(this.user.lastName)
      || !this.isEmailValid()
      || !this.isPhoneValid()
      || !this.isPasswordValid()) {
      this.errorMessage.set('אנא מלאי את כל השדות בצורה תקינה');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.userService.updateUser(this.user.id, this.user).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('הפרטים עודכנו בהצלחה');
        this.userService.currentUser.set({ ...this.userService.currentUser(), ...this.user });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.getErrorMessage(err));
      }
    });
  }
}