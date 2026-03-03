import { Injectable } from '@angular/core';
import { environment } from 'environment/environment';
import { Payment } from 'modules/payment/types';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentWsService {
  private paymentSocket: WebSocket;
  private paymentSubject = new Subject<Payment>();
  private isPaymentSocketOpen = false;

  constructor() {
    this.connectPaymentSocket();
  }

  private connectPaymentSocket() {
    this.paymentSocket = new WebSocket(`${environment.API_WS_URL}/payments`);

    this.paymentSocket.onopen = () => {
      console.log('Payment WebSocket connection established');
      this.isPaymentSocketOpen = true;
      this.paymentSocket.send(JSON.stringify({ type: 'PAYMENT_CONNECTED' }));
    };

    this.paymentSocket.onmessage = (event) => {
      // console.log('Payment WebSocket Received Data:', event.data);
      this.paymentSubject.next(JSON.parse(event.data));
    };

    this.paymentSocket.onerror = (event) => {
      console.error('Payment WebSocket error:', event);
    };

    this.paymentSocket.onclose = (event) => {
      console.log('Payment WebSocket closed:', event);
      this.isPaymentSocketOpen = false;
    };

    this.reconnectOnClose();
  }

  private reconnectOnClose() {
    this.paymentSocket.onclose = (event) => {
      console.log('Payment WebSocket closed:', event);
      this.isPaymentSocketOpen = false;
      setTimeout(() => this.connectPaymentSocket(), 5000); // Try to reconnect after 5 seconds
    };
  }

  sendPayment(payment: Payment): void {
    if (this.isPaymentSocketOpen) {
      this.paymentSocket.send(JSON.stringify(payment));
    } else {
      console.error('Payment WebSocket is not open. Cannot send payment.');
    }
  }

  getPaymentUpdates(): Observable<Payment> {
    return this.paymentSubject.asObservable();
  }
}
