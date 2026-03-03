import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-dual-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="flex flex-col">
      <span class="!mb-4">{{ title }}</span>
      <div class="flex-grow-0">
        <mat-form-field appearance="outline" class="w-full">
          <input
            matInput
            [value]="searchName"
            placeholder="Search"
            (input)="searchItems($event)"
          />
          <button
            mat-icon-button
            matSuffix
            *ngIf="searchName"
            (click)="clearSearch()"
          >
            <mat-icon>clear</mat-icon>
          </button>
        </mat-form-field>
      </div>
      <div class="flex flex-row justify-between items-start flex-grow mt-4">
        <select
          class="border border-gray-500 dual-multiselect flex-grow-0 w-[43%] p-4 font-medium"
          name="itemsToSelect"
          id="itemsToSelect"
          multiple
          (dblclick)="selectItem()"
          [(ngModel)]="itemsToSelect"
          [style.height.px]="buttonsHeight"
        >
          @for (item of items; track item.id) {
            <option [ngValue]="item">
              {{ item.name }}
            </option>
          }
        </select>
        <div class="flex flex-col justify-between items-center w-18 gap-1">
          <button
            color="primary"
            type="button"
            mat-raised-button
            [disabled]="itemsToSelect.length === 0"
            (click)="selectItem()"
          >
            <mat-icon>arrow_right</mat-icon>
          </button>
          <button
            color="primary"
            type="button"
            mat-raised-button
            [disabled]="itemsToRemove.length === 0"
            (click)="removeItem()"
          >
            <mat-icon>arrow_left</mat-icon>
          </button>
          <button
            color="primary"
            type="button"
            mat-raised-button
            (click)="addAllItems()"
          >
            <mat-icon>keyboard_double_arrow_right</mat-icon>
          </button>
          <button
            color="primary"
            type="button"
            mat-raised-button
            [disabled]="selectedItems.length === 0"
            (click)="removeAllItems()"
          >
            <mat-icon>keyboard_double_arrow_left</mat-icon>
          </button>
        </div>
        <select
          class="border border-gray-500 dual-multiselect flex-grow-0 w-[43%] p-4 font-medium"
          name="itemsToRemove"
          id="itemsToRemove"
          (dblclick)="removeItem()"
          [(ngModel)]="itemsToRemove"
          [style.height.px]="buttonsHeight"
          multiple
        >
          @for (item of selectedItems; track item.id) {
            <option [ngValue]="item">
              {{ item.name }}
            </option>
          }
        </select>
      </div>
    </div>
  `,
})
export class DualMultiSelectComponent implements OnInit {
  @Input() title: string = 'Select Roles';
  @Input() items: Item[] = [];
  @Input() selectedItems: Item[] = [];
  @Output() onAddRemove = new EventEmitter<{
    added: Item[];
    removed: Item[];
  }>();

  searchName: string = '';
  originalItems: Item[] = [];
  itemsToSelect: Item[] = [];
  itemsToRemove: Item[] = [];

  ngOnInit(): void {
    this.initializeState();
  }

  initializeState() {
    this.originalItems = [...this.items];
    this.items = this.items.filter(
      (item) => !this.selectedItems.some((selected) => selected.id === item.id),
    );
  }

  searchItems(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm) {
      this.items = this.originalItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm),
      );
    } else {
      this.items = [...this.originalItems];
    }
  }

  clearSearch() {
    this.searchName = '';
    this.items = [...this.originalItems];
  }

  selectItem() {
    this.itemsToSelect.forEach((item) => {
      this.selectedItems.push(item);
      this.items = this.items.filter((i) => i.id !== item.id);
    });
    this.onAddRemove.emit({ added: this.itemsToSelect, removed: [] });
    this.itemsToSelect = [];
  }

  removeItem() {
    this.itemsToRemove.forEach((item) => {
      this.items.push(item);
      this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id);
    });
    this.onAddRemove.emit({ added: [], removed: this.itemsToRemove });
    this.itemsToRemove = [];
  }

  addAllItems() {
    const addedItems = [...this.items];
    this.selectedItems.push(...this.items);
    this.items = [];
    this.itemsToSelect = [];
    this.onAddRemove.emit({ added: addedItems, removed: [] });
  }

  removeAllItems() {
    const removedItems = [...this.selectedItems];
    this.items.push(...this.selectedItems);
    this.selectedItems = [];
    this.itemsToRemove = [];
    this.onAddRemove.emit({ added: [], removed: removedItems });
  }

  get buttonsHeight(): number {
    return 154;
  }
}
