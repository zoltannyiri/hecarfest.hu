import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kezdolap',
  imports: [SidebarComponent, CommonModule],
  templateUrl: './kezdolap.component.html',
  styleUrl: './kezdolap.component.scss'
})
export class KezdolapComponent {
  artists = [
    { name: 'Előadó 1', image: 'assets/artist1.jpg' },
    { name: 'Előadó 2', image: 'assets/artist2.jpg' },
    { name: 'Előadó 3', image: 'assets/artist3.jpg' },
    { name: 'Előadó 4', image: 'assets/artist4.jpg' },
    { name: 'Előadó 5', image: 'assets/artist5.jpg' },
    { name: 'Előadó 6', image: 'assets/artist6.jpg' },
    { name: 'Előadó 7', image: 'assets/artist7.jpg' },
    { name: 'Előadó 8', image: 'assets/artist8.jpg' }
  ];
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
