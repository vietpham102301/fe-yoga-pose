import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http'
import { APP_SERVICE_CONFIG } from 'src/app/AppConfig/appconfig.service';
import { AppConfig } from 'src/app/AppConfig/appconfig.interface';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  constructor(private http: HttpClient, @Inject(APP_SERVICE_CONFIG) private config: AppConfig) { }

  register(resisterBody: any): Observable<any> {
      return this.http.post<any>(this.config.apiEndpoint + `/api/v1/users/register`, resisterBody);
  }
}
