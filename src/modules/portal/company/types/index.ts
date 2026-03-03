export interface CompanyType {
  id: string;
  uuid: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  name: string;
  code: string;
  isActive?: boolean;
}

export interface Company {
  id: string;
  uuid: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  companyTypeId: string;
  certificateRegistrationNumber: string;
  isActive?: boolean;
  website?: string;
  email: string;
  name: string;
  tradingName?: string;
  tin?: string;
  vat?: string;
  registrationType?: string;
  registrationDate?: string;
  registrationStatus?: string;
}
