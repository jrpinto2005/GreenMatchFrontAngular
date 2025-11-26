import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Plant } from '../models/plants.model';
import { CarePlan } from '../models/care-plan.model';

@Injectable({ providedIn: 'root' })
export class PlantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  list(userId: number): Observable<Plant[]> {
    const params = new HttpParams().set('user_id', String(userId));
    return this.http.get<Plant[]>(`${this.apiUrl}/plants/`, { params });
  }

  create(payload: Partial<Plant> & { user_id: number; common_name: string }): Observable<Plant> {
    return this.http.post<Plant>(`${this.apiUrl}/plants/`, payload);
  }

  get(id: number): Observable<Plant> {
    return this.http.get<Plant>(`${this.apiUrl}/plants/${id}`);
  }

  patch(id: number, payload: Partial<Plant>): Observable<Plant> {
    return this.http.patch<Plant>(`${this.apiUrl}/plants/${id}`, payload);
  }

  archive(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/plants/${id}`);
  }

  getCarePlan(plantId: number) {
    return this.http.get<CarePlan | null>(`${this.apiUrl}/plants/${plantId}/care-plan`);
  }

  uploadImage(plantId: number, file: File): Observable<Plant> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Plant>(`${this.apiUrl}/plants/${plantId}/image`, form);
  }
}
