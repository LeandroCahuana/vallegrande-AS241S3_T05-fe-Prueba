import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../layout/sidebar/sidebar/sidebar';
import { ServiceForm } from './service-form/service-form';
import { ServiceList } from './service-list/service-list';
import { LoadingAnimation } from 'app/shared/loading-animation/loading-animation';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Sidebar,
    FormsModule,
    LoadingAnimation,
    ServiceForm,
    ServiceList
  ],
  templateUrl: './service.html',
  styleUrls: ['./service.scss']
})
export class Service {
  searchTerm: string = '';
  isSidebarCollapsed = false;

  @ViewChild(ServiceList) serviceListComponent!: ServiceList;

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

  // Maneja el estado del sidebar
  onSidebarToggle(event: any) {

    this.isSidebarCollapsed = event as boolean;
  }

  onFormSaved(): void {
    this.serviceListComponent.resetFilters();
    this.serviceListComponent.loadServices();
  }

  onSearchChange(): void {
    this.serviceListComponent.filterBySearch(this.searchTerm);
  }
}
