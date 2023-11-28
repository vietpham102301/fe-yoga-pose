import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { WebsocketService } from '../websocket-service/web-socket.service';
import { Subscription } from 'rxjs';
import { PredictedResponse } from '../websocket-service/models/predicted-response';
import { IMAGE_URL, VIDEO_URL } from './constants/constant';
import { Router, NavigationStart } from '@angular/router';

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
  public imageUrl: string = "http://localhost:8080/api/v1/yoga/pose?poseName=anjaneyasana";
  public score: number = 0;
  private isProcessing: boolean = false;
  private threshold: number = 0.5;
  private isTriggerFromPause: boolean = false;
  private componentActive = true;
  private userID: any = localStorage.getItem('userId');
  private cameraTriggerFirstTime: boolean = true;


  private scheduleFrameCapture(): void {
    setTimeout(() => {
        this.captureAndSendFrame();
    }, 10000);
  }

  constructor(private websocketService: WebsocketService, private cdr: ChangeDetectorRef, private router: Router) {
    this.jsonMessageSubscription = this.websocketService.getJSONMessageObservable().subscribe((data: PredictedResponse) => {
      this.imageUrl = IMAGE_URL + data.predicted_class;
      console.log('Updated imageUrl:', this.imageUrl);
      this.predictedResponse = data;
      if (this.predictedResponse.confidence < this.threshold) {
        this.textToSpeechPoseNotDetected();

      } else {
        this.textToSpeech();
        const requestBody = {
          "name": this.predictedResponse.predicted_class,
          "score": this.score,
          "path": this.predictedResponse.image_path
        }
        this.saveHistory(requestBody);
      }
      this.textToSpeechNextPose();
      this.isProcessing = false;
    

      setTimeout(() => {
        this.startUpdating();
        clearInterval(this.counterInterval);
        this.counter = 10;
        this.isRecieved = true;
        this.scheduleFrameCapture();
      }, 7000);
     

      if (this.isTriggerFromPause) {
        this.isTriggerFromPause = false;
        return;
      }

    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.handleNavigationStart();
      }
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
    
    this.textToSpeechNotifyFirstPoseTaken();
    setTimeout(() => {
      this.startUpdating();
    }, 2000);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setTimeout(() => {
          video.srcObject = stream;
        video.addEventListener('play', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          if (this.isFirstPose && !this.isProcessing) {
            this.captureAndSendFrame();
            this.isProcessing = true;
          } else {
            if (!this.isProcessing && !this.isTriggerFromPause) {
              this.isProcessing = true;
              setTimeout(() => {
                this.captureAndSendFrame();
              }, this.counter * 1000);
            }
          }

        });
        }, 13000);
        
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  }

  private startUpdating(): void {
    if (!this.componentActive) {
      return;
    }
    this.counterInterval = setInterval(() => {
      this.updateCounter();
      this.cdr.detectChanges();
    }, 1000);

  }

  private updateCounter(): void {
    if ((!this.isStreamPaused && this.isRecieved) || (this.isFirstPose && !this.isStreamPaused) && this.cameraTriggerFirstTime) {
      if (this.counter > 0) {
        if(!this.componentActive){
          return
        }
        this.counter -= 1;
        this.textToSpeechCounting();
      } else {
        this.isRecieved = false;
        this.counter = 10;
        if(this.cameraTriggerFirstTime){
          this.cameraTriggerFirstTime = false;
          return
        }
        this.isFirstPose = false;
      }
    }

  }

  private textToSpeech(): void {
    if (this.predictedResponse && this.predictedResponse.predicted_class) {
      this.score = Math.trunc(this.predictedResponse.confidence * 10);
      const predicted_pose = new SpeechSynthesisUtterance("Predicted Pose is " + this.predictedResponse.predicted_class);
      const score = new SpeechSynthesisUtterance("Score is " + Math.trunc(this.predictedResponse.confidence * 10));

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
    if (!this.componentActive) {
      return;
    }
    const notify = new SpeechSynthesisUtterance("Processing the pose, please wait!");
    speechSynthesis.speak(notify);
  }

  private textToSpeechNotifyFirstPoseTaken(): void {
    const notify = new SpeechSynthesisUtterance("The first pose will be taken in 10 seconds");
    speechSynthesis.speak(notify);
  }

  private textToSpeechCounting(): void {
    const notify = new SpeechSynthesisUtterance(this.counter.toString());
    speechSynthesis.speak(notify);
  }
  private textToSpeechPoseNotDetected(): void {
    const notify = new SpeechSynthesisUtterance("Un-recoginized pose, please try again! Make sure you are in the frame. Copy the pose from the image if you are not sure.");
    speechSynthesis.speak(notify);
  }

  private textToSpeechCannotPauseTheFirstPose(): void {
    const notify = new SpeechSynthesisUtterance("Cannot pause the first pose");
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
            if (this.isFirstPose) {
          
                if(!this.componentActive){
                  return;
                }
                this.websocketService.send(binaryData);
                this.textToSpeechNotifyProcessing();

            } else {
              setTimeout(() => {
                if(!this.componentActive){
                  return;
                }
                this.websocketService.send(binaryData);
                this.textToSpeechNotifyProcessing();
              }, this.counter * 1000);
            }

          };
          reader.readAsArrayBuffer(blob);
        }

      }, 'image/png', 0.7);
    }
  }



  toggleStream(): void {
    const video = this.videoElement.nativeElement;
    if (this.isFirstPose) {
      this.textToSpeechCannotPauseTheFirstPose();
      return
    }
    if (this.isStreamPaused) {
      this.isTriggerFromPause = true;
      video.play();
    } else {
      video.pause();
    }
    this.isStreamPaused = !this.isStreamPaused;
  }


  ngOnDestroy(): void {
    this.websocketService.close();
    this.jsonMessageSubscription.unsubscribe();
    this.cancelSpeech();
    this.cleanup();
    this.componentActive = false;
    const video = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
  }

  private cleanup(): void {
    clearInterval(this.counterInterval);
    this.cancelSpeech();
  }

  private handleNavigationStart(): void {
    this.cleanup();
  }

  private cancelSpeech(): void {
    if (!this.componentActive) {
      speechSynthesis.cancel();
    }
  }

  saveHistory(requestBody: any): void {
    this.websocketService.saveHistory(this.userID, requestBody).subscribe({
      next: data => {
        console.log(data);
      },
      error: error => {
        console.error('There was an error!', error);
      }
    })


  }
}
