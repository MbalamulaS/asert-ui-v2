import 'zone.js';
import '@angular/material/prebuilt-themes/indigo-pink.css';
import '../node_modules/ngx-toastr/toastr.css';
import '../node_modules/leaflet/dist/leaflet.css';
import './styles.scss';
import './tailwind.scss';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from 'app/app.config';
import { AppComponent } from 'app/app.component';

if (import.meta.hot) {
  import('config/hmr').then(({ hmrBootstrap }) => {
    hmrBootstrap(import.meta.hot, () => bootstrapApplication(AppComponent, appConfig));
  });
} else {
  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
  );
}
