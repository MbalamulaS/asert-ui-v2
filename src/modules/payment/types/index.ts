export type Payment = {
  id: number;
  uuid: string;
  controNumber?: string;
  amount: number;
  datePaid: string;
  description: string;
  receiptNumber: string;
  isFullAmount: boolean;
  paymentChannel: string;
  spCode: string;
};
