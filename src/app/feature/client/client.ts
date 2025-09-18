import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar/sidebar';
import { ClientForm } from './client-form/client-form';
import { ClientList } from './client-list/client-list';
import { LoadingAnimation } from '../../shared/loading-animation/loading-animation';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Sidebar,
    ClientForm,
    ClientList,
    LoadingAnimation 
  ],
  templateUrl: './client.html',
  styleUrls: ['./client.scss']
})
export class Client implements OnInit {
  isSidebarCollapsed = false;
  isLoading = true;
  loadingTime = 3000;

  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        this.isLoading = false;
        document.body.style.overflow = 'auto';
      }, this.loadingTime);
    } else {
      this.isLoading = false;
    }
  }

  onSidebarToggle(event: any): void {
    this.isSidebarCollapsed = event as boolean;
  }
}
