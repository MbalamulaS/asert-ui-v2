import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from "@angular/forms";
import {HotelResponseDto} from "modules/assessment/assessment";


@Component({
  selector: 'app-assessor-data-score',
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
    <h1>Score</h1>
  `,
})
export class ScoreComponent implements OnInit {
  isSubmitting = false;
  @Input() hotelResponseDto: HotelResponseDto;
  @Output() onSubmit = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }
}
