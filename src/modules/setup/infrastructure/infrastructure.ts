export interface Infrastructure {
  id: number;
  uuid: string;
  code: string;
  name: string;
  infrastructureCategoryId: number;
  infrastructureCategoryName: string;
  infrastructureCategoryCode: string;
  quantity?: number;
}
