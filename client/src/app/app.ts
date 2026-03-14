import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header-component/header-component';
import { FooterComponent } from './components/footer-component/footer-component';
import { CartComponent } from './components/cart-component/cart-component';
import { CartService } from './services/cart-service';
import { AlertService } from './services/alert-service';
import { DrawerModule } from 'primeng/drawer'; 
import { ToastModule } from 'primeng/toast';  
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,  
    FormsModule,
    CartComponent ,
    DrawerModule,
    ToastModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('EventDressRentalProject');
  public cartService = inject(CartService);
  public alertService = inject(AlertService);
}