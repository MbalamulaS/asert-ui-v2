import { Observable, lastValueFrom } from 'rxjs';
import { TreeNode } from 'components/tree/tree.component';

/**
 * Load children for a node from an API
 * @param node The parent node to load children for
 * @param getChildrenFn Function that returns an Observable with children data
 * @param updateTreeFn Function to update the tree UI after changes
 */
export const loadNodeChildren = async (
  node: TreeNode,
  getChildrenFn: (uuid: string) => Observable<any>,
  updateTreeFn: () => void,
): Promise<void> => {
  try {
    // If children already loaded, just expand
    if (node.childrenLoaded) {
      node.expanded = true;
      updateTreeFn();
      return;
    }

    // Set loading state
    node.isLoading = true;
    updateTreeFn();

    // Fetch the children
    const response = await lastValueFrom(getChildrenFn(node.uuid));

    // The API returns the parent node with its children
    const parentWithChildren = response.data;
    if (!parentWithChildren) {
      console.error('Invalid response format - no data returned');
      node.isLoading = false;
      updateTreeFn();
      return;
    }

    // Extract the children array from the response
    const children = parentWithChildren.children || [];

    // Initialize children array if needed
    if (!node.children) {
      node.children = [];
    }

    // Make sure we don't add duplicate children
    const existingChildIds = new Set(node.children.map((c) => c.id));
    const newChildren = children.filter(
      (child) => !existingChildIds.has(child.id),
    );

    // Prepare each child node
    newChildren.forEach((child) => {
      child.level = (node.level || 0) + 1;
      child.expanded = false;
      child.visible = true;
      child.parent = node; // Set parent reference for path building

      // Check if the child has children
      child.hasChildren =
        (child.children && child.children.length > 0) || false;
      child.childrenLoaded =
        (child.children && child.children.length > 0) || false;

      // If the child has children, recursively set their parent references
      if (child.children && child.children.length > 0) {
        setParentReferences(child.children, child);
      }
    });

    // Add children to the node
    node.children = [...node.children, ...newChildren];
    node.childrenLoaded = true;
    node.expanded = true;

    // Important: Set loading to false BEFORE updating the tree
    node.isLoading = false;

    // Update the tree view
    updateTreeFn();
  } catch (error) {
    console.error('Error loading children for node:', node.name, error);
    node.isLoading = false;
    updateTreeFn();
  }
};

/**
 * Search treeData from API and transform into tree structure
 * @param searchTerm The search term
 * @param searchFn Function that returns an Observable with search results
 * @returns Tree nodes constructed from search results
 */
export const searchNodes = async (
  searchTerm: string,
  searchFn: (query: any) => Observable<any>,
): Promise<TreeNode[]> => {
  try {
    let query = {};

    if (searchTerm && searchTerm.length > 0) {
      query = { search: searchTerm };
    }

    const response = await lastValueFrom(searchFn(query));

    const searchResults = response.data || [];

    // If no results, return empty array
    if (!searchResults.length) {
      return [];
    }

    // The API returns a pre-built tree structure, so we don't need to rebuild it.
    // Instead, we just need to ensure the nodes have the required TreeNode properties.
    const prepareTreeNodes = (
      nodes: TreeNode[],
      level: number = 0,
      parent: TreeNode | null = null,
    ): TreeNode[] => {
      return nodes.map((node) => {
        const treeNode: TreeNode = {
          ...node,
          level: node.level ?? level, // Use the level from the API if present, otherwise calculate it
          expanded: node.expanded ?? false, // Use the API's expanded state if present
          visible: true,
          children: node.children || [],
          childrenLoaded: !!(node.children && node.children.length > 0),
          hasChildren: !!(node.children && node.children.length > 0),
          parent: parent,
        };

        // Recursively prepare children
        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children = prepareTreeNodes(
            treeNode.children,
            level + 1,
            treeNode,
          );
        }

        return treeNode;
      });
    };

    // Prepare the tree nodes
    const treeNodes = prepareTreeNodes(searchResults);

    return treeNodes;
  } catch (error) {
    console.error('Error searching treeData:', error);
    return [];
  }
};

/**
 * Recursively set parent references for all nodes
 * @param nodes Array of nodes to process
 * @param parent Parent node
 */
export const setParentReferences = (
  nodes: TreeNode[],
  parent: TreeNode,
): void => {
  nodes.forEach((node) => {
    node.parent = parent;

    if (node.children && node.children.length > 0) {
      setParentReferences(node.children, node);
    }
  });
};

/**
 * Find and update a specific node in a tree
 * @param nodes The tree nodes array to search in
 * @param updatedNode The node with updated data
 * @returns boolean indicating if the node was found and updated
 */
export const updateNodeInTree = (
  nodes: TreeNode[],
  updatedNode: TreeNode,
): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === updatedNode.id) {
      // Found the node, update it
      nodes[i] = { ...updatedNode };
      return true;
    }

    // Check children recursively
    if (nodes[i].children && nodes[i].children.length > 0) {
      if (updateNodeInTree(nodes[i].children, updatedNode)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Set level property for all nodes in the tree
 * @param node The root node
 * @param level The level value to set
 */
export const prepareNodeLevels = (node: TreeNode, level: number): void => {
  node.level = level;

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      child.parent = node;
      prepareNodeLevels(child, level + 1);
    });
  }
};
