import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, DialogModule],
  templateUrl: './footer-component.html',
  styleUrls: ['./footer-component.scss']
})
export class FooterComponent {
  currentYear = signal(new Date().getFullYear());
  showTermsDialog = false;

  contactInfo = {
    address: 'רחוב האומן 10, ירושלים',
    phone: '02-1234567',
    hours: [
      { days: 'א׳ - ה׳', time: '09:00 - 20:00' },
      { days: 'יום ו׳', time: '09:00 - 13:00' }
    ]
  };

  footerSections = [
    {
      title: 'קולקציות',
      links: [
        { label: 'כל הדגמים', url: '/models' },
        { label: 'שמלות ערב', url: '/evening-wear' },
        { label: 'שמלות ילדות', url: '/winter-collection' },
        { label: 'אקססוריז', url: '/accessories' },
      ]
    },
    {
      title: 'קישורים מהירים',
      links: [
        { label: 'דף הבית', url: '/home' },
        { label: 'העגלה שלי', url: '/cart' },
        { label: 'לתשלום', url: '/checkout' },
        { label: 'מבצעים', url: '/promotions' }
      ]
    },
    {
      title: 'שירות לקוחות',
      links: [
        { label: 'שאלות נפוצות', url: '/faq' },
        { label: 'משלוחים והחזרות', url: '/returns' },
        { label: 'יצירת קשר', url: '/contact' },
        { label: 'תקנון האתר', url: '/terms', action: 'showTerms' }
      ]
    },
    {
      title: 'אזור אישי',
      links: [
        { label: 'כניסה', url: '/login' },
        { label: 'הרשמה', url: '/register' },
        { label: 'ההזמנות שלי', url: '/personal-orders' },
        { label: 'הפרופיל שלי', url: '/user-profile' }
      ]
    }
  ];

  legalLinks = [
    { label: 'תקנון האתר', url: '/terms', action: 'showTerms' },
    { label: 'מדיניות פרטיות', url: '/privacy' },
    { label: 'נגישות', url: '/accessibility' }
  ];

  socials = [
    { icon: 'pi pi-facebook', link: '#' },
    { icon: 'pi pi-instagram', link: '#' },
    { icon: 'pi pi-whatsapp', link: '#' }
  ];

  onLinkClick(link: any, event: Event) {
    if (link.action === 'showTerms') {
      event.preventDefault();
      this.showTermsDialog = true;
    }
  }
}