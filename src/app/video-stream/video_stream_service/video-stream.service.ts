import { Injectable, Inject, ChangeDetectorRef } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http'
import { APP_SERVICE_CONFIG } from 'src/app/AppConfig/appconfig.service';
import { AppConfig } from 'src/app/AppConfig/appconfig.interface';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoStreamService {

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

  getYogaPose(poseName: string): Observable<any> {
    const options = this.getHeader();
    if(options !==null){
      return this.http.post<any>(this.config.apiEndpoint + `/api/v1/yoga/pose?poseName=${poseName}`, options);
    }
    return of(false);
  }
  saveHistory(poseName: string, score: number): Observable<any> {
    const options = this.getHeader();
    if(options !==null){
      return this.http.post<any>(this.config.apiEndpoint + `/api/v1/history/pose?poseName=${poseName}&score=${score}`, options);
    }
    return of(false);
  }
}
