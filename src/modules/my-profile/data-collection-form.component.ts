import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from "@angular/forms";


@Component({
  selector: 'app-assessor-data-collection-form',
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
    <h1>Data Collection Form</h1>
  `,
})
export class DataCollectionFormComponent implements OnInit {
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }
}
