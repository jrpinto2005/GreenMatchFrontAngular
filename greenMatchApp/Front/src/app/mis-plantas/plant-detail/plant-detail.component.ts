import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BarraSuperiorComponent } from '../../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../../barra-inferior/barra-inferior.component';
import { PlantService } from '../plants.service';
import { Plant } from '../../models/plants.model';

type CarePlan = {
  id: number;
  plant_id: number;
  created_at: string;
  environment_json?: Record<string, any> | null;
  plan_json: {
    riego: { frecuencia: string; detalle: string };
    luz: { tipo: string; detalle: string };
    temperatura: string;
    humedad: string;
    fertilizacion: { frecuencia: string; detalle: string };
    poda: string;
    plagas: string;
    alertas: string[];
  };
} | null;

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  imports: [CommonModule, BarraSuperiorComponent, BarraInferiorComponent],
  templateUrl: './plant-detail.component.html'
})
export class PlantDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(PlantService);

  plant!: Plant;
  plan: CarePlan = null;

  loadingPlant = true;
  loadingPlan = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/mis-plantas']);
      return;
    }

    this.svc.get(id).subscribe({
      next: p => {
        this.plant = p;
        this.loadingPlant = false;
      },
      error: () => {
        this.error = 'No se encontró la planta';
        this.loadingPlant = false;
      }
    });

    this.svc.getCarePlan(id).subscribe({
      next: cp => {
        this.plan = cp;
        this.loadingPlan = false;
      },
      error: () => {
        this.plan = null;
        this.loadingPlan = false;
      }
    });
  }

  back() {
    this.router.navigate(['/mis-plantas']);
  }

  crearPlan() {
    if (!this.plant) return;
    const luzLoc = [this.plant.light, this.plant.location, this.plant.humidity]
      .filter(Boolean)
      .join(' / ');
    const prompt = luzLoc
      ? `Generame por favor el plan de cuidado para ${this.plant.common_name} con condiciones de luz, ubicacion y humedad: ${luzLoc}`
      : `Generame por favor el plan de cuidado para ${this.plant.common_name}`;
    this.router.navigate(['/chat'], { queryParams: { prompt } });
  }
}
