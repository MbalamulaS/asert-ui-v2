import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { TreeNode } from 'components/tree/tree.component';
import {
  loadNodeChildren,
  searchNodes,
  updateNodeInTree,
} from 'components/tree/utils/tree-utils';

@Injectable({
  providedIn: 'root',
})
export class TreeService {
  // State management using BehaviorSubjects
  private treeDataSubject = new BehaviorSubject<TreeNode[]>([]);
  private originalTreeDataSubject = new BehaviorSubject<TreeNode[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private selectedNodeSubject = new BehaviorSubject<TreeNode | null>(null);

  // Public observables for components to subscribe to
  treeData$: Observable<TreeNode[]> = this.treeDataSubject.asObservable();
  originalTreeData$: Observable<TreeNode[]> =
    this.originalTreeDataSubject.asObservable();
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  selectedNode$: Observable<TreeNode | null> =
    this.selectedNodeSubject.asObservable();

  constructor() {}

  // Fetch the initial tree data
  async fetchTree(
    fetchFn: (params: any) => Observable<any>,
    params: any = { size: 1 },
  ): Promise<void> {
    this.isLoadingSubject.next(true);
    try {
      const response = await lastValueFrom(fetchFn(params));
      console.log('response', response);

      // Extract tree data, ensuring it's always an array
      let treeData: TreeNode[] = [];

      if (response.data) {
        // If response.data is an array, use it directly
        if (Array.isArray(response.data)) {
          treeData = response.data;
        }
        // If response.data is a single object that matches TreeNode structure
        else if (response.data.id !== undefined) {
          treeData = [response.data];
        }
        // Otherwise (e.g., if response.data is an object with nested data)
        else if (typeof response.data === 'object') {
          // Try to extract a children array if it exists
          if (response.data.children && Array.isArray(response.data.children)) {
            treeData = response.data.children;
          }
        }
      }

      this.treeDataSubject.next(treeData);
      this.originalTreeDataSubject.next(this.deepCloneTreeData(treeData));
    } catch (error) {
      console.error('Error fetching tree:', error);
      this.treeDataSubject.next([]);
      this.originalTreeDataSubject.next([]);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  // Search the tree based on a query
  async searchTree(
    searchTerm: string,
    searchFn: (query: any) => Observable<any>,
  ): Promise<void> {
    this.isLoadingSubject.next(true);
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        const originalTreeData = this.originalTreeDataSubject.getValue();
        this.treeDataSubject.next(this.deepCloneTreeData(originalTreeData));
        return;
      }

      const searchResults = await searchNodes(searchTerm, searchFn);
      if (searchResults && searchResults.length > 0) {
        // Process the search results to ensure proper tree structure
        const processedResults = this.processSearchResults(searchResults);
        this.treeDataSubject.next(processedResults);
      } else {
        this.treeDataSubject.next([]);
      }
    } catch (error) {
      console.error('Error searching tree:', error);
      this.treeDataSubject.next([]);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  // Search for a specific node by ID
  async searchTreeById(
    id: string | number,
    searchFn: (query: any) => Observable<any>,
  ): Promise<void> {
    this.isLoadingSubject.next(true);
    try {
      const response = await lastValueFrom(searchFn({ station_id: id }));
      const searchResults = response?.data || [];

      if (searchResults && searchResults.length > 0) {
        this.treeDataSubject.next(searchResults);
        const selectedNode = this.findNodeById(searchResults, id);
        this.selectedNodeSubject.next(selectedNode);
      } else {
        const originalTreeData = this.originalTreeDataSubject.getValue();
        this.treeDataSubject.next(this.deepCloneTreeData(originalTreeData));
      }
    } catch (error) {
      console.error('Error searching tree by ID:', error);
      const originalTreeData = this.originalTreeDataSubject.getValue();
      this.treeDataSubject.next(this.deepCloneTreeData(originalTreeData));
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  // Handle node selection and load children if needed
  async selectNode(
    node: TreeNode,
    fetchChildrenFn: (uuid: string) => Observable<any>,
  ): Promise<void> {
    this.selectedNodeSubject.next(node);

    if (!node.childrenLoaded && node.uuid) {
      await loadNodeChildren(node, fetchChildrenFn, () =>
        this.updateTreeView(),
      );
      const currentTreeData = this.treeDataSubject.getValue();
      updateNodeInTree(currentTreeData, node);
      this.treeDataSubject.next([...currentTreeData]);
    }
  }

  // Utility to deep clone tree data
  private deepCloneTreeData(nodes: TreeNode[]): TreeNode[] {
    // Ensure nodes is an array before calling map
    if (!Array.isArray(nodes)) {
      console.warn('Expected nodes to be an array, but got:', nodes);
      return [];
    }

    return nodes.map((node) => {
      const clonedNode: TreeNode = { ...node };

      if (node.children && node.children.length > 0) {
        clonedNode.children = this.deepCloneTreeData(node.children);
        clonedNode.children.forEach((child) => {
          child.parent = clonedNode;
        });
      }

      return clonedNode;
    });
  }

  // Utility to find a node by ID
  private findNodeById(
    nodes: TreeNode[],
    id: string | number,
  ): TreeNode | null {
    // Safety check to ensure nodes is an array
    if (!Array.isArray(nodes)) {
      return null;
    }

    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findNodeById(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Update the tree view
  private updateTreeView(): void {
    const currentTreeData = this.treeDataSubject.getValue();
    this.treeDataSubject.next([...currentTreeData]);
  }

  // Process search results to maintain proper TreeNode structure
  private processSearchResults(searchResults: any[]): TreeNode[] {
    return searchResults.map(result => this.mapToTreeNode(result));
  }

  // Map API response to TreeNode interface
  private mapToTreeNode(apiNode: any): TreeNode {
    const treeNode: TreeNode = {
      id: apiNode.id?.toString() || '',
      uuid: apiNode.uuid,
      name: apiNode.name || '',
      expanded: apiNode.expanded || false,
      highlighted: apiNode.highlighted || false,
      focused: apiNode.focused || false,
      visible: true,
      hasChildren: !!(apiNode.children && apiNode.children.length > 0),
      childrenLoaded: !!(apiNode.children && apiNode.children.length > 0),
      children: apiNode.children 
        ? apiNode.children.map((child: any) => this.mapToTreeNode(child))
        : undefined
    };

    // Set parent references for children
    if (treeNode.children) {
      treeNode.children.forEach(child => {
        child.parent = treeNode;
      });
    }

    return treeNode;
  }

  // Reset the tree state (if needed)
  reset(): void {
    this.treeDataSubject.next([]);
    this.originalTreeDataSubject.next([]);
    this.isLoadingSubject.next(false);
    this.selectedNodeSubject.next(null);
  }
}
