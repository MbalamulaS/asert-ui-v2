export interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
  expanded?: boolean;
}
