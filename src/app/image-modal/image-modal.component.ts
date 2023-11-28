import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-image-modal',
  template: `
    <img [src]="data.imageSrc" alt="Full Size" style="max-width: 100%; max-height: 100vh;">
  `,
})
export class ImageModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imageSrc: string }) {}
}

