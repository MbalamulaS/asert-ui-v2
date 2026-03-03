import { OverlayRef } from '@angular/cdk/overlay';
import { inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export class DialogRef {
  private afterClosedSubject = new Subject<any>();

  constructor(private overlayRef: OverlayRef) {}

  /**
   * closes the overlay.
   */
  public close(result?: any) {
    this.overlayRef.dispose();
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }

  /**
   * Gets an observable that is notified when the dialog is finished closing.
   */
  public afterClosed(): Observable<any> {
    return this.afterClosedSubject.asObservable();
  }
}
