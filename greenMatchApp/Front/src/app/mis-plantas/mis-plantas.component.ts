import { Component, HostListener, OnInit } from '@angular/core';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Plant {
  id?: number;
  name?: string;
  watered?: number;
  // add fields that match assets/data/plants.json
}

@Component({
  selector: 'mis-plantas',
  standalone: true,
  imports: [
    BarraInferiorComponent,
    BarraSuperiorComponent,
    CommonModule,
    RouterLink
    // remove HttpClientModule here — HttpClient is provided at app root via provideHttpClient()
  ],
  templateUrl: './mis-plantas.component.html',
  styleUrls: ['./mis-plantas.component.scss']
})
export class MisPlantasComponent implements OnInit {

  plantas: Plant[] = [];

  constructor(private http: HttpClient) { }

  addPlant() {
    console.log('Add plant clicked');
    this.togglePopup();
  }

  popupOpen = false;

  togglePopup() {
    console.log('Toggling popup. Current state:', this.popupOpen);
    this.popupOpen = !this.popupOpen;
    console.log('Popup state after toggle:', this.popupOpen);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    const clickedInsidePopup = !!target.closest('.popup');
    const clickedAddButton = !!target.closest('.add-btn');

    if (this.popupOpen && !clickedInsidePopup && !clickedAddButton) {
      this.popupOpen = false;
      console.log('Clicked outside popup, closing it.');
    }
  }

  ngOnInit() {
    this.http.get<any>('assets/data/plants.json')
      .subscribe({
        next: data => {
          if (Array.isArray(data)) {
            this.plantas = data;
          } else if (data && Array.isArray(data.plants)) {
            this.plantas = data.plants;
          } else if (data && typeof data === 'object') {
            this.plantas = Object.values(data) as Plant[];
          } else {
            this.plantas = [];
          }
        },
        error: err => console.error('Failed to load plants.json', err)
      });
  }

}
