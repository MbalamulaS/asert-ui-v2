export interface Reservation {
  id: number;
  uuid?: string;
  visitorIds: string;
  hotelId: string;
  hotelName?: string;
  roomTypeId: string;
  roomTypeName?: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  reservationCode?: string;
  isCheckedOut?:boolean;
}

export interface IncidentReport {
  id: number;
  uuid?: string;
  visitorId: string;
  hotelId: string;
  reservationId: string;
  incidentTypeId?: string;
  incidentDate: string;
  comment: string;
}
