import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { ModelModel } from '../../models/model.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-model-card-component',
  imports: [CardModule, ButtonModule],
  templateUrl: './model-card-component.html',
  styleUrl: './model-card-component.scss',
})
export class ModelCardComponent {
  private router = inject(Router);
  private userService = inject(UserService);
  
  @Input() model!: ModelModel;
  @Input() disableClick: boolean = false;

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
  }

  onCardClick() {
    if (this.disableClick) {
      return;
    }

    console.log('Navigating to model:', this.model.id);
    this.router.navigate(['/model', this.model.id]);
  }
}