import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { PredictedResponse } from './models/predicted-response';
import {HttpClient, HttpHeaders } from '@angular/common/http'
import { APP_SERVICE_CONFIG } from 'src/app/AppConfig/appconfig.service';
import { AppConfig } from 'src/app/AppConfig/appconfig.interface';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;
  private messageSubject = new Subject<PredictedResponse>();

  constructor(private http: HttpClient, @Inject(APP_SERVICE_CONFIG) private config: AppConfig) { }

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

  private getHeader(): any{
    const authToken = localStorage.getItem("token"); 
    if(authToken !== null){
      const headers = new HttpHeaders().set('X-Access-Token', authToken);
      const options = { headers: headers };
      return options
    }
    return null;
  }

  saveHistory(userId: number, requestBody: any): Observable<any> {
    const options = this.getHeader();
    if(options !== null){
      return this.http.post<any>(this.config.apiEndpoint + `/api/v1/history/pose?userID=${userId}`, requestBody, options);
    }
   
    return of([]);
  }
}
