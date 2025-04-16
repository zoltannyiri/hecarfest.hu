import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vip-regisztracio',
  imports: [RouterModule, CommonModule],
  templateUrl: './vip-regisztracio.component.html',
  styleUrl: './vip-regisztracio.component.scss'
})
export class VipRegisztracioComponent {
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('vipSection') vipSection!: ElementRef; // Ez hiányzott

  ngAfterViewInit() {
    setTimeout(() => {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
    });
  }

  scrollToVip(): void {
    if (this.vipSection && this.vipSection.nativeElement) {
      this.vipSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

}
