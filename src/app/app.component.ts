import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'services/auth.service';
import { ToastComponent } from 'components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet>
      <app-toast />
    </router-outlet>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AserT';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
