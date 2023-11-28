import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  constructor(private router: Router, private authService: AuthService){}

  username: any;

  ngOnInit(): void {
    this.dashboardLink = document.getElementById('dashboardLink')
    if(this.dashboardLink){
      this.dashboardLink.style.fontWeight = 'bold';
    }
    this.openInitialPage();
    this.count = 0;
    this.username = localStorage.getItem('username');
  }

  dashboardLink:any;
  count!:number;
  selectedLinkId:any;
  handleClick(event: MouseEvent, id: string) {
    if(this.count ===0){
      this.selectedLinkId = 'homeLink';
      this.count++;
    }
    if (this.selectedLinkId) {
      const previousLink = document.getElementById(this.selectedLinkId);
      if(previousLink)
      {
        previousLink.style.fontWeight = 'normal';
      }
      
    }
    
    const target = event.target as HTMLAnchorElement;
    target.style.fontWeight = 'bold';
    
    this.selectedLinkId = id;
    
  }
  


  logout() {
    this.authService.logout();
  }

  openInitialPage(){
    this.router.navigate(["/home/video-stream"]);
  }

  
  
}
