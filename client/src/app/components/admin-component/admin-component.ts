import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.scss',
})
export class AdminComponent  {
  private userService = inject(UserService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  currentUser = this.userService.currentUser;

  ngOnInit(): void {
    const user = this.currentUser();
      console.log('Current User:', user);
     console.log('Is Admin:', this.userService.isAdmin());
    if (!user) {
      this.alertService.show('יש להתחבר למערכת לפני ההמשך', 'error');
      this.router.navigate(['/login']); 
      return;
    }
    if (!this.userService.isAdmin()) {
      this.router.navigate(['/']); 
    }
  }
}