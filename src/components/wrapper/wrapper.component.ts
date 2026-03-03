import { Component } from '@angular/core';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  template: `
    <div
      class="mb-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class WrapperComponent {}
