import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-vip-regisztracio',
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './vip-regisztracio.component.html',
  styleUrl: './vip-regisztracio.component.scss'
})
export class VipRegisztracioComponent {
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('vipSection') vipSection!: ElementRef;
  @ViewChild('registrationForm') registrationForm!: ElementRef<HTMLFormElement>;

  constructor(private http: HttpClient) {}

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

  onSubmit(event: Event): void {
    event.preventDefault();
    
    const form = this.registrationForm.nativeElement;
    const formData = new FormData(form);
    
    // Ellenőrizzük, hogy van-e kiválasztott fájl
    let vanKep = false;
    
    // Külső képek ellenőrzése (1-4)
    for (let i = 1; i <= 4; i++) {
      const fileInput = form.querySelector(`input[name="carImage${i}"]`) as HTMLInputElement;
      if (fileInput?.files?.length) {
        vanKep = true;
        break;
      }
    }
    
    // Belső kép ellenőrzése
    const belsokepInput = form.querySelector('input[name="interiorImage"]') as HTMLInputElement;
    if (!vanKep && (!belsokepInput?.files?.length)) {
      alert('Legalább egy képet fel kell tölteni!');
      return;
    }
  
    this.http.post('http://localhost:3000/api/vip-registration', formData)
      .subscribe({
        next: (valasz: any) => {
          alert(valasz.message || 'Sikeres regisztráció! Hamarosan értesítünk e-mailben.');
          form.reset();
          
          // Fájlnevek visszaállítása
          for (let i = 1; i <= 4; i++) {
            const elem = document.getElementById(`autokep${i}`);
            if (elem) {
              elem.textContent = 'Nincs fájl kiválasztva';
              elem.classList.remove('text-green-300');
              elem.classList.add('text-gray-300');
            }
          }
          
          const belsoElem = document.getElementById('autobelso');
          if (belsoElem) {
            belsoElem.textContent = 'Nincs fájl kiválasztva';
            belsoElem.classList.remove('text-green-300');
            belsoElem.classList.add('text-gray-300');
          }
        },
        error: (hiba) => {
          console.error('Regisztrációs hiba:', hiba);
          const hibaUzenet = hiba.error?.message || 
                            'Hiba történt a regisztráció során. Kérjük, próbálja újra később.';
          alert(hibaUzenet);
        }
      });
  }

  updateFileName(event: Event, elementId: string): void {
    const input = event.target as HTMLInputElement;
    const fileNameElement = document.getElementById(elementId);
    
    if (input.files && input.files.length > 0 && fileNameElement) {
      fileNameElement.textContent = input.files[0].name;
      fileNameElement.classList.remove('text-gray-300');
      fileNameElement.classList.add('text-green-300');
      
      // Hibakereséshez
      console.log(`Fájl kiválasztva: ${elementId} - ${input.files[0].name}`);
    } else if (fileNameElement) {
      fileNameElement.textContent = 'Nincs fájl kiválasztva';
      fileNameElement.classList.remove('text-green-300');
      fileNameElement.classList.add('text-gray-300');
    }
  }
}