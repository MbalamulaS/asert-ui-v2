import { Assessor } from 'modules/assessment/assessment';

export enum PropertyType {
  TOWN_HOTEL = 'TOWN_HOTEL',
  VACATION_HOTEL = 'VACATION_HOTEL',
  RESTAURANT = 'RESTAURANT',
  LODGE = 'LODGE',
  TENTED_CAMP = 'TENTED_CAMP',
  VILLA = 'VILLA',
  COTTAGE = 'COTTAGE',
  SERVICED_APARTMENT = 'SERVICED_APARTMENT',
  MOTEL = 'MOTEL',
}

export enum HotelFacilityType {
  RESTAURANT = 'RESTAURANT',
  BAR = 'BAR',
  POOL = 'POOL',
  SPA = 'SPA',
  GYM = 'GYM',
  PARKING = 'PARKING',
  CONFERENCE_ROOM = 'CONFERENCE_ROOM',
  BUSINESS_CENTER = 'BUSINESS_CENTER',
  WIFI = 'WIFI',
  AIRPORT_SHUTTLE = 'AIRPORT_SHUTTLE',
  ROOM_SERVICE = 'ROOM_SERVICE',
  LAUNDRY_SERVICE = 'LAUNDRY_SERVICE',
  PET_FRIENDLY = 'PET_FRIENDLY',
  ACCESSIBLE_ROOMS = 'ACCESSIBLE_ROOMS',
  KIDS_PLAY_AREA = 'KIDS_PLAY_AREA',
  TENNIS_COURT = 'TENNIS_COURT',
  GOLF_COURSE = 'GOLF_COURSE',
  BEACH_ACCESS = 'BEACH_ACCESS',
  SKI_STORAGE = 'SKI_STORAGE',
  SAUNA = 'SAUNA',
  HAIR_SALON = 'HAIR_SALON',
  CURRENCY_EXCHANGE = 'CURRENCY_EXCHANGE',
  VALET_PARKING = 'VALET_PARKING',
  BICYCLE_RENTAL = 'BICYCLE_RENTAL',
  LIBRARY = 'LIBRARY',
  LOUNGE = 'LOUNGE',
  ROOFTOP_TERRACE = 'ROOFTOP_TERRACE',
  GARDEN = 'GARDEN',
}

export const HotelFacilityTypes: string[] = [
  'RESTAURANT',
  'BAR',
  'POOL',
  'SPA',
  'GYM',
  'PARKING',
  'CONFERENCE_ROOM',
  'BUSINESS_CENTER',
  'WIFI',
  'AIRPORT_SHUTTLE',
  'ROOM_SERVICE',
  'LAUNDRY_SERVICE',
  'PET_FRIENDLY',
  'ACCESSIBLE_ROOMS',
  'KIDS_PLAY_AREA',
  'TENNIS_COURT',
  'GOLF_COURSE',
  'BEACH_ACCESS',
  'SKI_STORAGE',
  'SAUNA',
  'HAIR_SALON',
  'CURRENCY_EXCHANGE',
  'VALET_PARKING',
  'BICYCLE_RENTAL',
  'LIBRARY',
  'LOUNGE',
  'ROOFTOP_TERRACE',
  'GARDEN',
];

export enum RegistrationState {
  DRAFT = 'DRAFT',

  SUBMITED_FOR_GRADING = 'SUBMITED_FOR_GRADING',

  // Hotel has been submitted for review
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',

  // Hotel was rejected during initial review
  REJECTED = 'REJECTED',

  // Hotel is being assessed by assessors
  UNDER_ASSESSMENT = 'UNDER_ASSESSMENT',

  // Assessment is complete and waiting for admin review
  AWAITING_GRADING_REVIEW = 'AWAITING_GRADING_REVIEW',

  // Hotel has been graded and license issued
  GRADED = 'GRADED',
}

export interface RoomType {
  id?: string;
  uuid?: string;
  name: string;
  description?: string;
  quantity: number;
  size?: number;
  maxOccupancy?: number;
  bedType?: string;
  hotelId?: string;
  hotelName?: string;
  version?: number;
  amenities: string[];
}

export interface HotelFacility {
  id?: string;
  uuid?: string;
  name: string;
  facilityType: HotelFacilityType;
  facilityTypeName?: string;
  description?: string;
  capacity?: number;
  openingHours?: string;
  hotelId?: string;
  hotelName?: string;
  version?: number;
}

export interface HotelMedia {
  id?: string;
  uuid?: string;
  description: string;
  isApproved: boolean;
  mediaId: string;
  mediaUrl?: string;
  mediaFileName?: string;
  mediaFileType?: string;
  hotelId?: string;
  hotelName?: string;
  userId?: string;
  userName?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Location {
  id?: string;
  name?: string;
  code?: string;
  level?: number;
  parentId?: string;
}

export interface Company {
  id?: string;
  uuid?: string;
  name: string;
  registrationNumber?: string;
  tin?: string;
  address?: string;
  email: string;
  phone: string;
  website?: string;
  isActive: boolean;
}

export interface Hotel {
  id?: number;
  uuid?: string;
  name: string;
  description: string;
  website?: string;
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  propertyType: PropertyType;
  propertyTypeName?: string;
  defaultImage?: HotelMedia;
  defaultImageId?: string;
  status: RegistrationState;
  statusName?: string;
  isActive: boolean;
  version?: number;
  companyName?: string;
  companyId: string;
  locationName?: string;
  locationId?: string;
  roomTypes?: RoomType[];
  facilities?: HotelFacility[];
  media?: HotelMedia[];
  createdAt?: string;
  updatedAt?: string;
  formUuid?: string;
  formName?: string;
  assessors: Array<Assessor>;
  assessorHotelId?: number;
  assessorHotelDateAssigned?: string;
  assessorHotelDeadline?: string;
  assessorHotelDataCollected?: boolean;
  assessmentStatus?: string;
  displayName?: string;
  score?: number;
  starRating?: string;
  userId?: string;

  // Pre-bound handler functions to avoid creating new functions on every change detection cycle
  editHandler?: () => void;
  viewHandler?: () => void;
  deleteHandler?: () => void;
  assessmentHandler?: () => void;
}

// Create a type for room amenities
export const ROOM_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'TV',
  'Mini Bar',
  'Safe',
  'Balcony',
  'Ocean View',
  'Mountain View',
  'City View',
  'Kitchen',
  'Bathtub',
  'Shower',
  'King Bed',
  'Queen Bed',
  'Twin Beds',
  'Sofa Bed',
  'Desk',
  'Coffee Maker',
  'Iron',
  'Hair Dryer',
  'Room Service',
  'Wheelchair Accessible',
  'Non-smoking',
];

// Create hotel property type options for select dropdowns
export const PROPERTY_TYPE_OPTIONS = Object.entries(PropertyType).map(
  ([key, value]) => ({
    id: value,
    name: key
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' '),
  }),
);

// Create hotel facility type options for select dropdowns
export const FACILITY_TYPE_OPTIONS = Object.entries(HotelFacilityType).map(
  ([key, value]) => ({
    id: value,
    value: value,
    label: value,
    name: key
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' '),
  }),
);

// Create registration state options for select dropdowns
export const REGISTRATION_STATE_OPTIONS = Object.entries(RegistrationState).map(
  ([key, value]) => ({
    value,
    viewValue: key.charAt(0) + key.slice(1).toLowerCase(),
  }),
);

// Bed type options
export const BED_TYPE_OPTIONS = [
  { id: 'KING', name: 'King' },
  { id: 'QUEEN', name: 'Queen' },
  { id: 'TWIN', name: 'Twin' },
  { id: 'DOUBLE', name: 'Double' },
  { id: 'SINGLE', name: 'Single' },
  { id: 'BUNK', name: 'Bunk Beds' },
  { id: 'SOFA', name: 'Sofa Bed' },
  { id: 'MURPHY', name: 'Murphy Bed' },
];

const rooms = [
  'King',
  'Queen',
  'Twin',
  'Double',
  'Single',
  'Bunk Beds',
  'Sofa Bed',
  'Murphy Bed',
];
