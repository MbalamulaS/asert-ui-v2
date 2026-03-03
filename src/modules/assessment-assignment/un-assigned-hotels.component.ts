import {Component, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from "@angular/forms";


@Component({
  selector: 'app-assessment-un-assigned-hotels',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,

  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <h1>Unasigned hotels</h1>
  `,
})
export class UnAssignedHotelsComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
