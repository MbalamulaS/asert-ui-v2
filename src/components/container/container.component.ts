import { Component } from '@angular/core';

@Component({
  selector: 'container',
  standalone: true,
  template: `
    <div class="p-4">
      <ng-content></ng-content>
    </div>
  `,
})
export class ContainerComponent {}
