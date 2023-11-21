import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { WebsocketService } from '../websocket-service/web-socket.service';
import { Subscription } from 'rxjs';
import { PredictedResponse } from '../websocket-service/models/predicted-response';
import { VIDEO_URL } from './constants/constant';

@Component({
  selector: 'app-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.scss']
})
export class VideoStreamComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  @ViewChild('imageElement') imageElement!: ElementRef;
  private context!: CanvasRenderingContext2D;
  private jsonMessageSubscription!: Subscription;
  predictedResponse: PredictedResponse | null = null;
  isStreamPaused: boolean = false;
  counter: number = 10;
  private counterInterval: any;
  private isRecieved: boolean = false;
  private isFirstPose: boolean = true;


  private scheduleFrameCapture(): void {
    setTimeout(() => {
      this.captureAndSendFrame();
    }, 10000);
  }

  constructor(private websocketService: WebsocketService, private cdr: ChangeDetectorRef,) {
    this.jsonMessageSubscription = this.websocketService.getJSONMessageObservable().subscribe((data: PredictedResponse) => {
      this.predictedResponse = data;
      this.textToSpeech();
      this.textToSpeechNextPose();
      setTimeout(() => {
        clearInterval(this.counterInterval);
        this.counter = 10;
        this.isRecieved = true;
        this.startUpdating();
        this.scheduleFrameCapture();
      }, 7000);
      this.cdr.detectChanges();
    });
   
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const image = this.imageElement.nativeElement;

    image.style.width = video.offsetWidth + 'px';
    
    this.context = canvas.getContext('2d');
  
    this.websocketService.connect(VIDEO_URL);
    
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
  
        video.addEventListener('play', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          this.captureAndSendFrame();
        });
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  }

  private startUpdating(): void {
    this.counterInterval = setInterval(() => {
      this.updateCounter();
      this.cdr.detectChanges();
    }, 1000);
  }

  private updateCounter(): void {
    if ((!this.isStreamPaused && this.isRecieved) || this.isFirstPose) {
      if (this.counter > 0) {
        this.counter -= 1;
      } else {
        this.isRecieved = false;
        this.counter = 10;
        this.isFirstPose = false;
      }
    }
    
  }
  
  private textToSpeech(): void {
    if (this.predictedResponse && this.predictedResponse.predicted_class) {
      const predicted_pose = new SpeechSynthesisUtterance("Predicted Pose is " + this.predictedResponse.predicted_class);
      const score = new SpeechSynthesisUtterance("Score is " + Math.trunc(this.predictedResponse.confidence * 10));
      
      // Uncomment the following line if you want to set specific options for the speech synthesis
      predicted_pose.voice = speechSynthesis.getVoices()[0];
      score.voice = speechSynthesis.getVoices()[0];
  
      speechSynthesis.speak(predicted_pose);
      speechSynthesis.speak(score);
    }
  }

  private textToSpeechNextPose(): void {
    if (this.predictedResponse && this.predictedResponse.predicted_class) {
      const notify = new SpeechSynthesisUtterance("Ready for next pose in 10 seconds");
      speechSynthesis.speak(notify);
    }
  }

  private textToSpeechNotifyProcessing(): void {
      const notify = new SpeechSynthesisUtterance("Processing the pose, please wait!");
      speechSynthesis.speak(notify);
  }

  private textToSpeechNotifyFirstPoseTaken(): void {
    const notify = new SpeechSynthesisUtterance("The first pose will be taken in 10 seconds");
    speechSynthesis.speak(notify);
}


  private captureAndSendFrame(): void {
    if (!this.isStreamPaused) {

      this.context.drawImage(
        this.videoElement.nativeElement,
        0,
        0,
        this.videoElement.nativeElement.videoWidth,
        this.videoElement.nativeElement.videoHeight
      );
      this.canvasElement.nativeElement.toBlob((blob: Blob | null) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            const binaryData = new Uint8Array(reader.result as ArrayBuffer);
            if(this.isFirstPose){
              this.textToSpeechNotifyFirstPoseTaken();
              setTimeout(() => {
                this.startUpdating();
              }, 4000);
             
              setTimeout(() => {
                this.websocketService.send(binaryData);
                this.textToSpeechNotifyProcessing();
              }, 14000);
              
            }else{
              this.websocketService.send(binaryData);
              this.textToSpeechNotifyProcessing();
            }
            
          };
          reader.readAsArrayBuffer(blob);
        }

      }, 'image/png', 0.7);
    }
  }

  toggleStream(): void {
    const video = this.videoElement.nativeElement;
    
    if (this.isStreamPaused) {
      video.play();
    } else {
      video.pause();
    }

    this.isStreamPaused = !this.isStreamPaused;
  }
  

  ngOnDestroy(): void {
    this.websocketService.close();
    this.jsonMessageSubscription.unsubscribe();
  }
}
