import { Component } from '@angular/core';
import { SavedService } from './saved-service/saved.service';
import { History } from './models/history';
import { MatDialog } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent {
  constructor(private savedService: SavedService, public dialog: MatDialog) { }
  userID: any = localStorage.getItem('userId');

  ngOnInit(): void {
    this.fetchSaved(this.userID, "0", "10");
  }

  saved : History[] = [];

  openImageModal(imageSrc: string) {
    this.dialog.open(ImageModalComponent, {
      data: { imageSrc },
    });
  }

  fetchSaved(userId: string, page: string, size: string) {
    this.savedService.getHistory(userId, page, size).subscribe((data: any) => {
      this.saved = data;
      //filter out the saved detections
      this.saved = this.saved.filter((history) => history.is_saved === true);
      console.log(this.saved);
    });
  }



  deleteDetection(history: any) {
    this.savedService.deleteHistory(history.id).subscribe(
      {
        next: (result) => {
          console.log(result);
          if (result) {
            this.fetchSaved(this.userID, "0", "10");
          }
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
    
  }

}
