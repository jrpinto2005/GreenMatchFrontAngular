import { Component, OnInit } from '@angular/core';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Plant {
  id?: number;
  name?: string;
  // add fields that match assets/data/plants.json
}

@Component({
  selector: 'mis-plantas',
  standalone: true,
  imports: [
    BarraInferiorComponent,
    BarraSuperiorComponent,
    CommonModule
    // remove HttpClientModule here — HttpClient is provided at app root via provideHttpClient()
  ],
  templateUrl: './mis-plantas.component.html',
  styleUrls: ['./mis-plantas.component.scss']
})
export class MisPlantasComponent implements OnInit {

  plantas: Plant[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any>('assets/data/plants.json')
      .subscribe({
        next: data => {
          // Normalize response into an array to avoid NG02200 / NG0900
          if (Array.isArray(data)) {
            this.plantas = data;
          } else if (data && Array.isArray(data.plants)) {
            this.plantas = data.plants;
          } else if (data && typeof data === 'object') {
            // fallback: convert object keyed by id into array of values
            this.plantas = Object.values(data) as Plant[];
          } else {
            this.plantas = [];
          }
        },
        error: err => console.error('Failed to load plants.json', err)
      });
  }

}
