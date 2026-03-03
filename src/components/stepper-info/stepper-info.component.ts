import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper-info',
  template: `
    <div class="stepper-container">
      <div *ngFor="let item of items; let i = index" class="step">
        <div
          class="step-icon"
          [class.completed]="completedSteps.includes(item)"
          [class.active]="i === completedSteps.length"
        >
          {{ i + 1 }}
        </div>
        <div
          class="step-label"
          [class.completed]="completedSteps.includes(item)"
        >
          {{ item }}
        </div>
        <div class="step-separator" *ngIf="i < items.length - 1"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .stepper-container {
        display: flex;
        align-items: center;
      }

      .step {
        display: flex;
        align-items: center;
        position: relative;
      }

      .step-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #e0e0e0;
        color: white;
        margin-right: 10px;
        font-weight: bold;
      }

      .step-icon.completed {
        background-color: #4caf50;
      }

      .step-icon.active {
        background-color: #1e88e5;
      }

      .step-label {
        font-size: 14px;
        margin-right: 20px;
      }

      .step-label.completed {
        font-weight: bold;
        color: #4caf50;
      }

      .step-separator {
        height: 2px;
        flex: 1;
        background-color: #e0e0e0;
        margin: 0 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class CustomStepperComponent implements OnInit {
  @Input() items: string[] = [];
  @Input() completedSteps: string[] = [];

  constructor() {}

  ngOnInit(): void {}
}
