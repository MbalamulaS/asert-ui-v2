import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginPreloaderComponent } from 'components/preloader/login-preloader';
import { PreloaderService } from 'components/preloader/preloader.service';

@Component({
  selector: `app-login-layout`,
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginPreloaderComponent],
  template: `<div class="relative h-screen w-full justify-center items-center">
    <div>
      <h2>Toolbar</h2>
    </div>
    <div>
      <router-outlet></router-outlet>
    </div>
    <div>
      <h2>Foooter</h2>
    </div>
    <login-preloader />
  </div>`,
})
export class LoginLayoutComponent {
  loading$ = this.preloaderService.loading$;
  constructor(private preloaderService: PreloaderService) {}
}
