export interface Assessor {
  id?: number;
  uuid?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name?: string;
  province?: string;
  category?: string;
  image?: string;
  email: string;
  phone: string;
  description: string;
  phoneTwo: string;
  photo?: string;
  profilePhoto?: {
    id: number;
    uuid: string;
    name: string;
    uploadType: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  };
  profilePhotoId?: number;
  title: string;
  identificationId: string;
  identificationType: string;
  status?: string;
  sex: string;
  locationId: number;
  locationName: number;
  verifiedBy?: number;
  verificationNotes?: string;
  dateVerified?: string;
  dateApplied?: string;
  dateRejected?: string;
  dob: string;
  reasonId?: number;
  rejectionDescription?: string;
  rejectionReason?: string;
  user?: AssessorUserDto;
  completionPercentage?: number;
}

export interface AssessorUserDto {
  id?: number;
  uuid?: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
}

export interface EducationBackground {
  id?: number;
  uuid?: string;
  fromDate: string;
  toDate?: string | null;
  institution?: string;
  course?: string;
  educationLevelId?: number;
  educationLevelName?: string;
  graduated: boolean;
  certificate: string;
  assessorId: number;
}

export interface EmploymentHistory {
  id?: number;
  uuid?: string;
  fromDate: string;
  toDate?: string | null;
  positionHeld: string;
  company: string;
  assessorId: number;
}

export interface AssessorReference {
  id?: number;
  uuid?: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface AssessorRejectionReason {
  id?: number;
  uuid?: string;
  code: string;
  reason: string;
}

export interface AssessorDocument {
  id?: number;
  uuid?: string;
  title: string;
  filePath: string;
  fileType: string;
  verified: boolean;
  documentTypeId: number;
  documentTypeName?: string;
  uploadedAt?: string;
}

export interface AssessorCertification {
  id?: number;
  uuid?: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  description: string;
}

export interface AssessorProfile {
  assessor: Assessor;
  educationBackgroundList: EducationBackground[];
  employmentHistoryDtoList: EmploymentHistory[];
  referenceDtoList: AssessorReference[];
  documentDtoList: AssessorDocument[];
  certificationDtoList: AssessorCertification[];
  preferenceDtoList: AssessorPreference[];
}

export interface AssessorPreference {
  id: number;
  uuid: string;
  preference: string;
}

export interface HotelResponseDto {
  id?: number;
  uuid?: string;
  assessorHotelId: number | null;
  assessorHotelDateAssigned: string | null;
  assessorHotelDeadline: string | null;
  assessorHotelDataCollected: boolean | null;
  assessmentStatus: string | null;

  name: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;

  latitude: number | null;
  longitude: number | null;

  propertyType: string | null;
  propertyTypeName: string | null;

  formUuid: string | null;
  formName: string | null;

  defaultImage: HotelMediaResponseDto | null;

  status: string | null;
  statusName: string | null;

  isActive: boolean | null;

  version: number | null;

  companyName: string | null;
  companyId: number | null;

  locationName: string | null;
  locationId: number | null;
  displayName: string | null;

  roomTypes: RoomTypeResponseDto[];
  facilities: HotelFacilityResponseDto[];
  media: HotelMediaResponseDto[];

  createdAt: string;
  updatedAt: string | null;
}

export interface HotelMediaResponseDto {
  id: number | null;
  uuid: string | null;

  description: string | null;
  isApproved: boolean | null;

  mediaId: number | null;
  mediaUrl: string | null; // Base64 string or file URL
  mediaFileName: string | null;
  mediaFileType: string | null;

  hotelId: number | null;
  hotelName: string | null;

  userId: number | null;
  userName: string | null;

  isDefault: boolean | null;

  createdAt: string | null; // Format: "yyyy-MM-dd HH:mm:ss"
}

export interface HotelFacilityResponseDto {
  id: number | null;
  uuid: string | null;

  name: string | null;
  facilityType: string | null;
  facilityTypeName: string | null;
  description: string | null;
  capacity: number | null;
  openingHours: string | null;

  hotelId: number | null;
  hotelName: string | null;

  version: number | null;
}

export interface RoomTypeResponseDto {
  id: number | null;
  uuid: string | null;

  name: string | null;
  description: string | null;
  quantity: number | null;
  size: number | null;
  maxOccupancy: number | null;
  bedType: string | null;

  hotelId: number | null;
  hotelName: string | null;

  version: number | null;

  amenities: string[];
}
