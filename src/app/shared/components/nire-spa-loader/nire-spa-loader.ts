import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nire-spa-loader.html',  
  styleUrls: ['./nire-spa-loader.scss']
})
export class Loader implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
