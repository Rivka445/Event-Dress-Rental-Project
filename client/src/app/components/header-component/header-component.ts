import { Component, OnInit, inject, effect } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';

import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenubarModule, MenuModule, AvatarModule, FormsModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.scss'],
})
export class HeaderComponent implements OnInit {
  public userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private viewportScroller = inject(ViewportScroller);
  public cartService = inject(CartService);

  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;
  guestMenuItems: MenuItem[] | undefined;

  searchTextLocal: string = '';
  searchActive: boolean = false;
  showSearch: boolean = true;

  isLoggedIn = this.userService.isLoggedIn; 
  currentUser = this.userService.currentUser;

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();
      this.updateMenuItems(user);
    });

    this.router.events.subscribe(() => {
      const url = this.router.url.split('?')[0];
      this.showSearch = url !== '/' && url !== '/home' && !url.startsWith('/admin');
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  ngOnInit() {
    const url = this.router.url.split('?')[0];
    this.showSearch = url !== '/' && url !== '/home' && !url.startsWith('/admin');

    this.route.queryParams.subscribe(params => {
      this.searchTextLocal = params['search'] || '';
      this.searchActive = !!this.searchTextLocal;
    });
  }

  private updateMenuItems(user: any) {
    const isAdmin = this.userService.isAdmin();

    this.items = [
      { label: 'קולקציה', routerLink: '/collection' },
      { label: 'דף הבית', routerLink: '/' },
      { label: 'איזור אישי', routerLink: '/personal' },
      ...(isAdmin ? [{ label: 'ניהול', routerLink: '/admin' }] : [])
    ];

    this.userMenuItems = isAdmin ? [
      { label: 'איזור אישי', icon: 'pi pi-user', routerLink: '/personal' },
      { label: 'איזור ניהול', icon: 'pi pi-cog', routerLink: '/admin' },
      { separator: true },
      { label: 'התנתק', icon: 'pi pi-sign-out', command: () => this.logout() }
    ] : [
      { label: 'איזור אישי', icon: 'pi pi-user', routerLink: '/personal' },
      { label: 'ההזמנות שלי', icon: 'pi pi-list',  routerLink: `/orders/${user?.id}` },
      { label: 'עגלת קניות', icon: 'pi pi-shopping-cart', command: () => this.onCart() },
      { separator: true },
      { label: 'התנתק', icon: 'pi pi-sign-out', command: () => this.logout() }
    ];

    this.guestMenuItems = [
      { label: 'התחבר', icon: 'pi pi-sign-in', routerLink: '/login' },
      { label: 'הרשם', icon: 'pi pi-user-plus', routerLink: '/register' }
    ];
  }

  toggleGuestMenu(event: Event, menu: any) {
    menu.toggle(event);
  }

  toggleUserMenu(event: Event, menu: any) {
    menu.toggle(event);
  }

  onCart() {
    this.router.navigate(['/checkout']);
  }

  openSearch() {
    this.searchActive = true;
  }

  closeSearch() {
    this.searchActive = false;
    this.searchTextLocal = '';
    const currentParams = this.route.snapshot.queryParams;
    this.router.navigate(['/collection'], {
      queryParams: { ...currentParams, search: null, page: 1 }
    });
  }

  onSearchTextChange() {
    if (!this.searchTextLocal || this.searchTextLocal.trim() === '') {
      this.performSearch();
    }
  }

  performSearch() {
    const text = this.searchTextLocal.trim();
    const currentParams = this.route.snapshot.queryParams;
    this.router.navigate(['/collection'], {
      queryParams: { ...currentParams, search: text || null, page: 1 }
    });
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  isAdmin = () => this.userService.isAdmin();
}