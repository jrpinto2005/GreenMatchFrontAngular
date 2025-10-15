import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Plant {
  id: number;
  name: string;
}

interface PlantResponse {
  plants: Plant[];
}

@Injectable({
  providedIn: 'root'
})
export class PlantCatalogService {
  private readonly http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/plants.json';

  getPlants(): Observable<Plant[]> {
    return this.http.get<PlantResponse>(this.dataUrl).pipe(map((response) => response.plants));
  }
}
