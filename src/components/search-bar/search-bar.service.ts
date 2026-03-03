import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchBarService {
  overlayOpen = signal(false);

  setOverlayOpen(isOpen: boolean) {
    this.overlayOpen.set(isOpen);
  }

  constructor() {}
}
