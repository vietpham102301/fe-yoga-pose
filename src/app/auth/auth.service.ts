import { Injectable, Inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {HttpClient, HttpHeaders } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators';
import { APP_SERVICE_CONFIG } from '../AppConfig/appconfig.service';
import { AppConfig } from '../AppConfig/appconfig.interface';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper: JwtHelperService;
  
  private Authenticated!: boolean


  constructor(private router: Router, private http: HttpClient, @Inject(APP_SERVICE_CONFIG) private config: AppConfig) {
    this.jwtHelper = new JwtHelperService();
    this.Authenticated= false;
  }

  public isLoggedIn(): boolean {
    const token = localStorage.getItem('token');

   
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    }
    
    return false;
  }

  public isAuthenticated(): boolean{
    return this.Authenticated;
  }
 
  public setUserId(userId: any, username: any): void{
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public logout(): void {
    this.Authenticated = false;
    localStorage.removeItem('token');
    localStorage.removeItem("userId");
    this.router.navigate(['/login']);
  }

  public Authenticate(username: string, password: string): Observable<any> {
    const requestBody = { username, password };
    console.log("authenticate");
    return this.http.post<any>(this.config.apiEndpoint+"/api/v1/users/login", requestBody, { observe: 'response' }).pipe(
      map((response) => {
        const headers: HttpHeaders = response.headers;
        console.log(headers);
        const token: string | null = headers.get('X-Access-Token');
        const userId: string = response.body.id;
        const username: string = response.body.username;
        
        if (token !== null) {
          this.setToken(token);
          this.setUserId(userId, username);
          this.Authenticated = true;
        }
        console.log(response);
        return !!token; 
      }),
      catchError((error) => {
        
        return of(error); 
      })
    );
  }
  
  
}
