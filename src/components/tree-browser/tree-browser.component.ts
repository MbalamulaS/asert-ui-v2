import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from './data';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tree-browser',
  standalone: true,
  styleUrls: ['./tree.scss'],
  imports: [CommonModule, MatIconModule, NgIf, NgFor],
  template: `
    <ul class="tree">
      <li>
        <mat-icon
          *ngIf="node && node.children?.length > 0 && node.expanded"
          (click)="toggleState(node)"
          class="relative -left-2 -top-1"
          >expand_more</mat-icon
        >
        <mat-icon
          *ngIf="!node?.expanded && node && node.children?.length > 0"
          (click)="toggleState(node)"
          class="relative -left-2 -top-1"
          >chevron_right</mat-icon
        >
        <span
          *ngIf="node"
          (click)="nodeClicked($event)"
          [class]="getClass(node)"
          [ngStyle]="{
            position: 'relative',
            top: '-10px',
            padding: '3px 10px',
            cursor: 'pointer'
          }"
        >
          {{ node.name }}
        </span>
        <ul [ngStyle]="{ display: node?.expanded ? 'block' : 'none' }">
          <ng-container *ngIf="node?.children?.length > 0">
            @for (child of node.children; track child.id) {
              <tree-browser
                [node]="child"
                [currentNode]="currentNode"
                (onNodeClicked)="onNodeClicked.emit($event)"
              />
            }
          </ng-container>
        </ul>
      </li>
    </ul>
  `,
})
export class TreeBrowserComponent implements OnInit {
  @Input() node: TreeNode;
  @Input() currentNode?: TreeNode;
  @Output() onNodeClicked = new EventEmitter<TreeNode>();

  ngOnInit(): void {}

  nodeClicked(event) {
    event.preventDefault();
    this.onNodeClicked.emit(this.node);
  }

  getClass(node: TreeNode): string | null {
    return this.currentNode && node && node.id === this.currentNode.id
      ? 'active'
      : null;
  }

  toggleState(node: TreeNode) {
    node.expanded = !node.expanded;
  }
}
