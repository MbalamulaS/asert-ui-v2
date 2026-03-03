import { Component, Inject, ViewChild } from '@angular/core';
import { CdkPortalOutlet, Portal } from '@angular/cdk/portal';
import { OverlayRef } from '@angular/cdk/overlay';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'dialog-container',
  template: `<ng-template cdkPortalOutlet></ng-template>`,
})
export class DialogContainerComponent {
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  constructor(
    public dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
    private overlayRef: OverlayRef,
  ) {}

  // Method to attach the component portal
  attachComponentPortal<T>(portal: Portal<T>): void {
    this.portalOutlet.attach(portal);
  }
}
