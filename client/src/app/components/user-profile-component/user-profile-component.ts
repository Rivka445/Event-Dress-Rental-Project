import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DialogModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './user-profile-component.html',
  styleUrl: './user-profile-component.scss',
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  currentUser = this.userService.currentUser;

  // פיצ'רים מהגרסה שלה
  showUpdateDialog = false;
  editUser: UserModel | null = null;
  errorMessage = '';
  showSuccessAlert = false;
  formTouched = false;

  isAdmin = () => this.userService.isAdmin();

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.alertService.show('יש להתחבר למערכת לפני ההמשך', 'error');
      this.router.navigate(['/login']);
    }
  }

  // ניווט לעדכון דרך דף נפרד (שמור מהגרסה שלך)
  navigateToUpdate(): void {
    // אם רוצים להמשיך לדיאלוג פנימי
    this.editUser = { ...this.currentUser()! };
    this.showUpdateDialog = true;
    this.errorMessage = '';
    this.showSuccessAlert = false;
  }

  closeDialog(): void {
    this.showUpdateDialog = false;
    this.editUser = null;
    this.errorMessage = '';
    this.showSuccessAlert = false;
    this.formTouched = false;
  }

  isEmailValid(): boolean {
    const email = (this.editUser?.email || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isPhoneValid(): boolean {
    const phone = (this.editUser?.phone || '').replace(/[^0-9]/g, '');
    return /^05\d{8}$/.test(phone);
  }

  isNameValid(value?: string): boolean {
    return !!value && value.trim().length >= 2;
  }

  isPasswordValidOptional(): boolean {
    const password = (this.editUser?.password || '').trim();
    return password.length === 0 || password.length >= 6;
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
    return normalizedMessage || 'שגיאה בעדכון הפרטים';
  }

  updateProfile(): void {
    if (!this.editUser) return;

    this.formTouched = true;

    if (!this.isNameValid(this.editUser.firstName)
      || !this.isNameValid(this.editUser.lastName)
      || !this.isEmailValid()
      || !this.isPhoneValid()
      || !this.isPasswordValidOptional()) {
      this.errorMessage = 'אנא מלאי את כל השדות בצורה תקינה';
      return;
    }

    this.userService.updateUser(this.editUser.id, this.editUser).subscribe({
      next: () => {
        this.closeDialog();
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 600);
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err);
        console.error(err);
      }
    });
  }

  navigateToOrders(): void {
    const userId = this.currentUser()?.id;
    if (userId) {
      this.router.navigate(['/orders', userId]).then(() => {
        window.scrollTo(0, 0);
      });
    }
  }

  navigateToCart(): void {
    this.router.navigate(['/checkout']).then(() => {
      window.scrollTo(0, 0);
    });
  }
}