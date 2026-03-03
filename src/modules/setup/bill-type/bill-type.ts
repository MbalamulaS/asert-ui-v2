export interface BillType {
  id: string;
  uuid: string;
  name: string;
  code: string;
  rate: number;
  description: string;
  expirationDate: string;
  effectiveDate: string;
  isPartial: boolean;
  status: string;
}
