import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PredictedResponse } from './models/predicted-response';
import {HttpHeaders } from '@angular/common/http'
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;
  private messageSubject = new Subject<PredictedResponse>();


  connect(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const data = event.data;

      if (data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          const textDecoder = new TextDecoder('utf-8');
          const jsonString = textDecoder.decode(uint8Array);

          const jsonObject = JSON.parse(jsonString) as PredictedResponse;
          this.messageSubject.next(jsonObject);
        };
        reader.readAsArrayBuffer(data);
      } else if (typeof data === 'string') {
        const jsonObject = JSON.parse(data) as PredictedResponse;
        this.messageSubject.next(jsonObject);
      }
    };
  }

  send(data: Uint8Array): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  onMessage(callback: (event: MessageEvent) => void): void {
    if (this.ws) {
      this.ws.onmessage = callback;
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  getJSONMessageObservable() {
    return this.messageSubject.asObservable();
  }
}
