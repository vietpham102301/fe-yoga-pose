import { Component } from '@angular/core';
import { HistoryService } from './history-service/history.service';
import { History } from './models/history';
import { MatDialog } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  constructor(private historyService: HistoryService, public dialog: MatDialog) { }
  userID: any = localStorage.getItem('userId');

  ngOnInit(): void {
    this.fetchHistory(this.userID, "0", "10");
  }

  history : History[] = [];

  openImageModal(imageSrc: string) {
    this.dialog.open(ImageModalComponent, {
      data: { imageSrc },
    });
  }

  fetchHistory(userId: string, page: string, size: string) {
    this.historyService.getHistory(userId, page, size).subscribe((data: any) => {
      this.history = data;
    });
  }

  deleteDetection(history: any) {
    this.historyService.deleteHistory(history.id).subscribe(
      {
        next: (result) => {
          console.log(result);
          if (result) {
            this.fetchHistory(this.userID, "0", "10");
          }
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
    
  }

  saveDetection(history: any) {
    this.historyService.savedHistory(history.id).subscribe(
      {
        next: (result) => {
          console.log(result);
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }
}
