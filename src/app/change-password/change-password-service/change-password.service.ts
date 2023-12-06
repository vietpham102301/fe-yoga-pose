import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http'
import { APP_SERVICE_CONFIG } from 'src/app/AppConfig/appconfig.service';
import { AppConfig } from 'src/app/AppConfig/appconfig.interface';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

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

  updatePassword(userId: string, requestBody: any): Observable<any> {
    const options = this.getHeader();
    if(options !== null){
      return this.http.put<any>(this.config.apiEndpoint + `/api/v1/users/update-password/${userId}`, requestBody,options);
    }
    return of([]);
  }
}
