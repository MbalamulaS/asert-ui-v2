type data = {
  data: Array<any>[];
};

export interface ApiResponse {
  data: any;
  status: number;
  message: string;
  page: number;
  size: number;
  total: number;
  errors: string[];
}
