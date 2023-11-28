import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http'
import { APP_SERVICE_CONFIG } from 'src/app/AppConfig/appconfig.service';
import { AppConfig } from 'src/app/AppConfig/appconfig.interface';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private http: HttpClient, @Inject(APP_SERVICE_CONFIG) private config: AppConfig) { }


  private getHeader(): any{
    const authToken = localStorage.getItem("token"); 
    if(authToken !== null){
      const headers = new HttpHeaders().set('X-Access-Token', authToken);
      const options = { headers: headers };
      return options
    }
    return null;
  }

  getHistory(userId: string, page: string, size: string): Observable<any> {
    const options = this.getHeader();
    if(options !== null){
      return this.http.get<any>(this.config.apiEndpoint + `/api/v1/history/pose?userID=${userId}&pageSize=${size}&pageNum=${page}`, options);
    }
    return of([]);
  }

  deleteHistory(historyId: string): Observable<any> {
    const options = this.getHeader();
    if(options !== null){
      return this.http.delete<any>(this.config.apiEndpoint + `/api/v1/history/pose/${historyId}`, options);
    }
    return of([]);
  }

  savedHistory(historyId: string): Observable<any> {
    const options = this.getHeader();
    if(options !== null){
      return this.http.put<any>(this.config.apiEndpoint + `/api/v1/history/pose/${historyId}`, {}, options);
    }
    return of([]);
  }
}
