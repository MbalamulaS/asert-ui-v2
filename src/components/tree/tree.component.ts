import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SearchComponent } from 'components/search/search.component';

export interface TreeNode {
  id: string;
  uuid?: string;
  name: string;
  children?: TreeNode[];
  expanded?: boolean;
  visible?: boolean;
  level?: number;
  hasChildren?: boolean;
  isLoading?: boolean;
  childrenLoaded?: boolean;
  parent?: TreeNode;
  highlighted?: boolean;
  focused?: boolean;
}

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SearchComponent],
  template: `
    <div class="w-full">
      <!-- Search input -->
      <app-search
        [label]="searchLabel"
        class="w-full md:flex-grow"
        (onSearch)="handleSearch($event)"
      />

      <!-- Tree -->
      <hr class="border-gray-200 mt-4" />
      <div class="bg-white rounded overflow-hidden border-t border-gray-300">
        <div
          *ngIf="filteredNodes.length === 0"
          class="p-4 text-gray-500 text-center text-sm"
        >
          No nodes match your search
        </div>
        <div class="tree-container max-h-80 overflow-y-auto">
          <ng-container
            *ngFor="let node of filteredNodes; let i = index; let isLast = last"
          >
            <div
              *ngIf="node.visible !== false"
              class="tree-node-wrapper relative"
              [class.is-last-sibling]="isLastSiblingAtLevel(node, i)"
            >
              <!-- Vertical connection lines from parent to children -->
              <ng-container *ngFor="let level of getAncestorLevels(node)">
                <div
                  class="connector vertical"
                  [ngStyle]="{
                    left: level * 24 + 12 + 'px',
                  }"
                ></div>
              </ng-container>

              <!-- Horizontal line to this node -->
              <div
                *ngIf="node.level && node.level > 0"
                class="connector horizontal"
                [ngStyle]="{
                  left: (node.level - 1) * 24 + 12 + 'px',
                  width: '12px',
                }"
              ></div>
              <!-- Node container -->

              <div
                class="tree-node flex items-center py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                [class.bg-blue-50]="selectedNode?.id === node.id"
                [class.selected-node]="selectedNode?.id === node.id"
                [class.highlighted-node]="node.highlighted"
                [class.focused-node]="node.focused"
                [id]="'tree-node-' + node.id"
                (click)="selectNode(node)"
                [ngStyle]="{ 'margin-left.px': node.level * 20 }"
              >
                <!-- Toggle button or spacer -->
                <div class="toggle-button">
                  <button
                    *ngIf="hasChildren(node)"
                    (click)="toggleNode(node, $event)"
                    class="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 relative z-10"
                  >
                    <mat-icon
                      *ngIf="!node.isLoading"
                      class="text-gray-700 text-base transform transition-transform duration-200"
                      [class.rotate-90]="node.expanded"
                    >
                      chevron_right
                    </mat-icon>
                    <mat-icon
                      *ngIf="node.isLoading"
                      class="text-gray-700 text-base animate-spin"
                    >
                      sync
                    </mat-icon>
                  </button>
                </div>

                <!-- Node content -->
                <mat-icon class="node-icon">folder</mat-icon>
                <span class="node-name truncate">{{ node.name }}</span>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tree-container {
        background-color: white; /* White background as requested */
        color: #4a4a4a; /* Darker text color for contrast on white background */
        height: 100%;
        padding: 10px;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
          Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }

      .tree-node-wrapper {
        position: relative;
        height: 40px;
        display: flex;
        align-items: center;
      }

      .tree-node {
        display: flex;
        align-items: center;
        z-index: 2;
        position: relative;
        transition: transform 0.3s ease;
      }

      .toggle-button {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .node-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 8px;
        color: #4a4a4a; /* Darker icon color for contrast */
      }

      .node-name {
        margin-right: 5px;
        font-size: 14px;
      }

      .connector {
        position: absolute;
        background-color: #e5e7eb; /* Lighter gray that matches your screenshot */
        z-index: 1;
      }

      .connector.vertical {
        width: 1px;
        top: 0;
        bottom: 0; /* Ensures the line extends all the way */
      }

      .connector.horizontal {
        height: 1px;
        top: 20px; /* Exactly half of the 40px node height */
      }

      .tree-node-wrapper {
        position: relative;
        min-height: 40px;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #4a4a4a; /* Darker icon color for contrast */
      }

      .rotate-90 {
        transform: rotate(90deg);
      }

      .selected-node {
        background-color: #d4e6e0;
        border: 1px solid #000;
        border-radius: 20px;
        padding: 2px;
      }

      .highlighted-node {
        background-color: #fef3c7 !important; /* Yellow highlight for search results */
        font-weight: 600;
      }

      .focused-node {
        background-color: #dbeafe !important; /* Blue highlight for primary focus */
        border: 2px solid #3b82f6;
        border-radius: 8px;
        font-weight: 700;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      /* Ensure focused takes priority over highlighted */
      .focused-node.highlighted-node {
        background-color: #dbeafe !important;
      }
    `,
  ],
})
export class TreeComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() nodes: TreeNode[] = [];
  @Input() selectedNodeId: string | number | null = null;
  @Input() searchLabel: string = 'search tree elements...';
  @Output() nodeSelected = new EventEmitter<TreeNode>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() nodeToggled = new EventEmitter<TreeNode>();

  searchTerm: string = '';
  filteredNodes: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  allNodesFlat: TreeNode[] = [];
  private shouldScrollToFocused = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScrollToFocused) {
      this.scrollToFocusedNode();
      this.shouldScrollToFocused = false;
    }
  }

  handleSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterNodes();
    this.onSearch.emit(searchTerm);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes'] && this.nodes) {
      Promise.resolve().then(() => {
        this.prepareNodes(this.nodes);
        this.allNodesFlat = this.flattenAllNodes(this.nodes);
        this.filteredNodes = this.flattenNodes(this.nodes);

        if (this.selectedNodeId !== null && this.selectedNodeId !== undefined) {
          this.selectNodeById(this.selectedNodeId);
        }

        // Check if there's a focused node to scroll to
        const focusedNode = this.findFocusedNode(this.nodes);
        if (focusedNode) {
          this.shouldScrollToFocused = true;
        }
      });
    }

    if (changes['selectedNodeId'] && !changes['nodes']) {
      if (this.selectedNodeId !== null && this.selectedNodeId !== undefined) {
        this.selectNodeById(this.selectedNodeId);
      } else {
        this.selectedNode = null;
        this.filteredNodes = this.flattenNodes(this.nodes);
      }
    }
  }

  prepareNodes(
    nodes: TreeNode[],
    level: number = 0,
    parent: TreeNode | null = null,
  ): void {
    nodes.forEach((node) => {
      node.level = level;
      node.parent = parent;

      if (node.expanded === undefined) {
        node.expanded = false;
      }

      node.visible = true;
      node.childrenLoaded =
        Array.isArray(node.children) && node.children.length > 0;
      node.hasChildren = node.childrenLoaded || node.hasChildren;

      if (node.children && node.children.length > 0) {
        this.prepareNodes(node.children, level + 1, node);
      }
    });
  }

  flattenNodes(nodes: TreeNode[]): TreeNode[] {
    let result: TreeNode[] = [];

    nodes.forEach((node) => {
      result.push(node);

      if (node.children && node.children.length > 0 && node.expanded) {
        result = result.concat(this.flattenNodes(node.children));
      }
    });

    return result;
  }

  flattenAllNodes(nodes: TreeNode[]): TreeNode[] {
    let result: TreeNode[] = [];

    nodes.forEach((node) => {
      result.push(node);

      if (node.children && node.children.length > 0) {
        result = result.concat(this.flattenAllNodes(node.children));
      }
    });

    return result;
  }

  buildNodePath(node: TreeNode): TreeNode[] {
    const path: TreeNode[] = [node];
    let current = node;

    while (current.parent) {
      path.unshift(current.parent);
      current = current.parent;
    }

    return path;
  }

  filterNodes(): void {
    if (!this.searchTerm.trim()) {
      this.resetVisibility(this.nodes);
      this.filteredNodes = this.flattenNodes(this.nodes);
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();

    const matchingNodes = this.allNodesFlat.filter((node) =>
      node.name.toLowerCase().includes(searchTermLower),
    );

    if (matchingNodes.length === 0) {
      this.filteredNodes = [];
      return;
    }

    this.resetVisibility(this.nodes, false);

    const nodesToShow = new Set<TreeNode>();

    matchingNodes.forEach((node) => {
      const path = this.buildNodePath(node);
      path.forEach((pathNode) => {
        nodesToShow.add(pathNode);
        pathNode.visible = true;

        if (
          pathNode !== node &&
          pathNode.children &&
          pathNode.children.length > 0
        ) {
          pathNode.expanded = true;
        }
      });
    });

    this.filteredNodes = this.flattenNodes(this.nodes);
  }

  resetVisibility(nodes: TreeNode[], visible: boolean = true): void {
    nodes.forEach((node) => {
      node.visible = visible;

      if (node.children && node.children.length > 0) {
        this.resetVisibility(node.children, visible);
      }
    });
  }

  toggleNode(node: TreeNode, event: Event): void {
    event.stopPropagation();

    if (node.expanded) {
      node.expanded = false;
      this.filteredNodes = this.flattenNodes(this.nodes);
      return;
    }

    this.nodeToggled.emit(node);

    if (node.childrenLoaded) {
      node.expanded = true;
      this.filteredNodes = this.flattenNodes(this.nodes);
    }
  }

  selectNode(node: TreeNode): void {
    this.selectedNode = node;
    this.nodeSelected.emit(node);
  }

  selectNodeById(nodeId: string | number): void {
    const node = this.allNodesFlat.find((n) => n.id === nodeId);
    if (node) {
      this.selectedNode = node;

      const path = this.buildNodePath(node);
      path.forEach((pathNode) => {
        pathNode.expanded = true;
        pathNode.visible = true;
      });

      path.forEach((pathNode) => {
        if (pathNode.parent) {
          const siblings = this.allNodesFlat.filter(
            (n) =>
              n.parent?.id === pathNode.parent?.id &&
              n.level === pathNode.level,
          );
          siblings.forEach((sibling) => {
            sibling.visible = true;
          });
        }
      });

      this.filteredNodes = this.flattenNodes(this.nodes);
    }
  }

  hasChildren(node: TreeNode): boolean {
    return !!((node.children && node.children.length > 0) || node.hasChildren);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterNodes();
  }

  updateTree(): void {
    this.allNodesFlat = this.flattenAllNodes(this.nodes);
    this.filteredNodes = this.flattenNodes(this.nodes);
  }

  getSpacersForNode(node: TreeNode): { isLastChild: boolean }[] {
    const spacers: { isLastChild: boolean }[] = [];

    if (!node.level) {
      return spacers;
    }

    let current: TreeNode | undefined = node;
    let path: TreeNode[] = [];

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    for (let i = 1; i < path.length; i++) {
      const parentNode = path[i - 1];
      const currentNode = path[i];

      const isLastChild =
        parentNode.children &&
        parentNode.children.length > 0 &&
        parentNode.children[parentNode.children.length - 1].id ===
          currentNode.id;

      spacers.push({ isLastChild });
    }

    return spacers;
  }

  isLastSiblingAtLevel(node: TreeNode, _index: number): boolean {
    if (!node.parent) return true;

    const siblings = this.filteredNodes.filter(
      (n) =>
        n.visible !== false &&
        n.level === node.level &&
        n.parent?.id === node.parent?.id,
    );

    return siblings[siblings.length - 1]?.id === node.id;
  }

  // Helper method to mimic findLastIndex
  findLastIndex<T>(array: T[], predicate: (item: T) => boolean): number {
    for (let i = array.length - 1; i >= 0; i--) {
      if (predicate(array[i])) {
        return i;
      }
    }
    return -1;
  }

  getConnectorLevels(
    node: any,
    index: number,
  ): { level: number; height: number }[] {
    const levels: { level: number; height: number }[] = [];

    // For each level in the ancestry
    for (let level = 0; level < node.level; level++) {
      // Find the parent at this level
      let parentAtLevel: any = node;
      while (parentAtLevel && parentAtLevel.level > level) {
        parentAtLevel = parentAtLevel.parent;
      }

      if (!parentAtLevel || parentAtLevel.level !== level) continue;

      // Check if there are more nodes after this that share the same parent at this level
      const hasMoreSiblingsOrDescendants = this.filteredNodes
        .slice(index + 1)
        .some((n) => {
          // Find the ancestor of this node at the current level
          let ancestor = n;
          while (ancestor && ancestor.level > level) {
            ancestor = ancestor.parent;
          }

          // Check if it's the same parent we found earlier
          return (
            ancestor &&
            ancestor.level === level &&
            ancestor.id === parentAtLevel.id
          );
        });

      if (hasMoreSiblingsOrDescendants) {
        // Calculate height to the last descendant
        const lastDescendantIndex = this.findLastIndex(
          this.filteredNodes.slice(index + 1),
          (n) => {
            let ancestor = n;
            while (ancestor && ancestor.level > level) {
              ancestor = ancestor.parent;
            }
            return (
              ancestor &&
              ancestor.level === level &&
              ancestor.id === parentAtLevel.id
            );
          },
        );

        if (lastDescendantIndex !== -1) {
          const lastRowIndex = lastDescendantIndex + index + 1;
          const calculatedHeight = (lastRowIndex - index) * 40;
          levels.push({ level, height: calculatedHeight });
        }
      }
    }

    return levels;
  }

  getAncestorLevels(node: TreeNode): number[] {
    if (!node.level || node.level === 0) return [];

    const levels: number[] = [];
    const nodeIndex = this.filteredNodes.findIndex((n) => n.id === node.id);

    // For each ancestor level, check if we need a vertical line
    for (let level = 0; level < node.level; level++) {
      // Find the ancestor at this level
      let ancestorAtLevel: TreeNode | undefined = node;
      while (ancestorAtLevel && ancestorAtLevel.level > level) {
        ancestorAtLevel = ancestorAtLevel.parent;
      }

      if (!ancestorAtLevel || ancestorAtLevel.level !== level) continue;

      // Check if this node has any siblings after it that share the same ancestor
      const hasSiblingsAfter = this.filteredNodes
        .slice(nodeIndex + 1)
        .some((n) => {
          if (n.level <= level) return false;

          // Traverse up to find the ancestor at the target level
          let currentAncestor = n;
          while (currentAncestor && currentAncestor.level > level) {
            currentAncestor = currentAncestor.parent;
          }

          return currentAncestor && currentAncestor.id === ancestorAtLevel?.id;
        });

      if (hasSiblingsAfter) {
        levels.push(level);
      }
    }

    return levels;
  }

  /**
   * Find the focused node in the tree
   */
  private findFocusedNode(nodes: TreeNode[]): TreeNode | null {
    for (const node of nodes) {
      if (node.focused) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const focused = this.findFocusedNode(node.children);
        if (focused) {
          return focused;
        }
      }
    }
    return null;
  }

  /**
   * Scroll to the focused node
   */
  private scrollToFocusedNode(): void {
    const focusedNode = this.findFocusedNode(this.nodes);
    if (!focusedNode) return;

    const nodeElement = this.elementRef.nativeElement.querySelector(
      `#tree-node-${focusedNode.id}`
    );

    if (nodeElement) {
      // Scroll the tree container to show the focused node
      const treeContainer = this.elementRef.nativeElement.querySelector('.tree-container');
      if (treeContainer) {
        const containerRect = treeContainer.getBoundingClientRect();
        const nodeRect = nodeElement.getBoundingClientRect();
        
        // Calculate scroll position to center the node in the container
        const scrollTop = treeContainer.scrollTop + 
          (nodeRect.top - containerRect.top) - 
          (containerRect.height / 2) + 
          (nodeRect.height / 2);

        treeContainer.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }

      // Add a subtle animation to draw attention
      nodeElement.style.transform = 'scale(1.02)';
      setTimeout(() => {
        nodeElement.style.transform = 'scale(1)';
      }, 300);
    }
  }
}
