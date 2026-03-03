import { Injectable } from '@angular/core';
import { environment } from 'environment/environment';
import { Bill } from 'modules/billing/types';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BillWsService {
  private billSocket: WebSocket;
  private billSubject = new Subject<Bill>();
  private isBillSocketOpen = false;

  constructor() {
    this.connectBillSocket();
  }

  private connectBillSocket() {
    this.billSocket = new WebSocket(`${environment.API_WS_URL}/bills`);

    this.billSocket.onopen = () => {
      console.log('Bill WebSocket connection established');
      this.isBillSocketOpen = true;
    };

    this.billSocket.onmessage = (event) => {
      this.billSubject.next(JSON.parse(event.data));
    };

    this.billSocket.onerror = (event) => {
      console.error('Bill WebSocket error:', event);
    };

    this.billSocket.onclose = (event) => {
      console.log('Bill WebSocket closed:', event);
      this.isBillSocketOpen = false;
    };
  }

  getBillUpdates(): Observable<Bill> {
    return this.billSubject.asObservable();
  }
}
