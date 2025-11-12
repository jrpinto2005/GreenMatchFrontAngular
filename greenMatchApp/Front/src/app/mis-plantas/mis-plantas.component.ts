import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { Plant } from '../models/plants.model';
import { PlantService } from './plants.service';

@Component({
  selector: 'mis-plantas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BarraSuperiorComponent, BarraInferiorComponent],
  templateUrl: './mis-plantas.component.html',
  styleUrls: ['./mis-plantas.component.scss']
})
export class MisPlantasComponent implements OnInit {
  private readonly plantSvc = inject(PlantService);
  private readonly router = inject(Router);

  userId = Number(localStorage.getItem('user_id'));
  loading = false;
  error: string | null = null;

  plantas: Plant[] = [];

  // UI estado modal
  formOpen = false;
  editing: Plant | null = null;
  form = {
    common_name: '',
    nickname: '',
    location: '',
    light: '',
    notes: ''
  };

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    if (!this.userId) return;
    this.loading = true;
    this.error = null;
    this.plantSvc.list(this.userId).subscribe({
      next: (rows) => { this.plantas = rows; this.loading = false; },
      error: (err) => { this.error = 'No se pudieron cargar tus plantas'; this.loading = false; console.error(err); }
    });
  }

  // ---- Alta / Edición ----
  openCreate() {
    this.editing = null;
    this.form = { common_name: '', nickname: '', location: '', light: '', notes: '' };
    this.formOpen = true;
  }
  openEdit(p: Plant) {
    this.editing = p;
    this.form = {
      common_name: p.common_name || '',
      nickname: p.nickname || '',
      location: p.location || '',
      light: p.light || '',
      notes: p.notes || ''
    };
    this.formOpen = true;
  }
  closeForm() { this.formOpen = false; }

  saveForm() {
    if (!this.userId) return;

    if (this.editing) {
      this.plantSvc.patch(this.editing.id, {
        common_name: this.form.common_name,
        nickname: this.form.nickname,
        location: this.form.location,
        light: this.form.light,
        notes: this.form.notes
      }).subscribe({
        next: () => { this.formOpen = false; this.fetch(); },
        error: (e) => console.error('No se pudo actualizar', e)
      });
    } else {
      if (!this.form.common_name.trim()) { alert('Nombre común es obligatorio'); return; }
      this.plantSvc.create({
        user_id: this.userId,
        common_name: this.form.common_name.trim(),
        nickname: this.form.nickname || undefined,
        location: this.form.location || undefined,
        light: this.form.light || undefined,
        notes: this.form.notes || undefined,
        source: 'manual'
      }).subscribe({
        next: () => { this.formOpen = false; this.fetch(); },
        error: (e) => console.error('No se pudo crear', e)
      });
    }
  }

  archive(p: Plant) {
    if (!confirm(`¿Archivar "${p.common_name}"?`)) return;
    this.plantSvc.archive(p.id).subscribe({
      next: () => this.fetch(),
      error: (e) => console.error('No se pudo archivar', e)
    });
  }

  // ---- Navegar a detalle ----
  openDetail(p: Plant) {
    this.router.navigate(['/mis-plantas', p.id]);
  }

  // ---- Botón "Crear plan" → abrir chat con prompt ----
  crearPlan(p: Plant) {
    const luzLoc = [p.light, p.location].filter(Boolean).join(' / ');
    const prompt = luzLoc
      ? `Dame plan para ${p.common_name} en ${luzLoc}`
      : `Dame plan para ${p.common_name}`;
    // pasa el prompt al chat vía query param
    this.router.navigate(['/chat'], { queryParams: { prompt } });
  }
}
