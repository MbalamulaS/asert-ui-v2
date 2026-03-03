import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type EventType = {
  type: string;
  value: boolean;
};

export interface LayoutConfig {
  contentWidth?: string;
  navbarColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  // Event subjects
  private eventSubject = new Subject<EventType>();
  private dialogEventSubject = new Subject<boolean>();
  private loadMenuEventSubject = new Subject<boolean>();
  currentMenuData = this.loadMenuEventSubject.asObservable();

  // Layout configuration with default constrained width
  private layoutConfigSubject = new BehaviorSubject<LayoutConfig>({
    contentWidth: 'mt-20 container min-h-screen mx-auto !w-[80%]',
    navbarColor: 'default',
  });

  // Observable streams
  dialogEvent$ = this.dialogEventSubject.asObservable();
  event$ = this.eventSubject.asObservable();
  layoutConfig$ = this.layoutConfigSubject.asObservable();

  /**
   * Emits a dialog open/close event
   * @param isOpen Boolean indicating if dialog should be open
   */
  emitEvent(isOpen: boolean) {
    this.dialogEventSubject.next(isOpen);
  }

  /**
   * Emits a credential-related event
   * @param event Event object with type and value
   */
  emitCredentialEvent(event: EventType) {
    this.eventSubject.next(event);
  }

  /**
   * Updates the layout configuration
   * @param config Layout configuration object
   */
  setLayoutConfig(config: LayoutConfig) {
    // Merge with current config to maintain unspecified values
    const currentConfig = this.layoutConfigSubject.getValue();
    this.layoutConfigSubject.next({
      ...currentConfig,
      ...config,
    });
  }

  /**
   * Resets layout configuration to default values
   */
  resetLayoutConfig() {
    this.layoutConfigSubject.next({
      contentWidth: 'container mx-auto max-w-4xl',
      navbarColor: 'default',
    });
  }

  /**
   * Gets the current layout configuration
   * @returns Current layout configuration
   */
  getCurrentLayoutConfig(): LayoutConfig {
    return this.layoutConfigSubject.getValue();
  }

  updateMenus(value:boolean){
    this.loadMenuEventSubject.next(true);
  }
}
