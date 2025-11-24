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
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BarraSuperiorComponent,
    BarraInferiorComponent
  ],
  templateUrl: './mis-plantas.component.html'
})
export class MisPlantasComponent implements OnInit {
  private readonly plantSvc = inject(PlantService);
  private readonly router = inject(Router);

  readonly placeholderImage = 'assets/plant-placeholder.jpg';

  userId = Number(localStorage.getItem('user_id'));
  loading = false;
  error: string | null = null;

  plantas: Plant[] = [];

  formOpen = false;
  editing: Plant | null = null;
  form = {
    common_name: '',
    nickname: '',
    location: '',
    light: '',
    humidity: '',
    notes: ''
  };

  // 🔸 NUEVO: estado de imagen en el formulario
  formImageFile: File | null = null;
  formImagePreview: string | null = null;

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    if (!this.userId) return;
    this.loading = true;
    this.error = null;
    this.plantSvc.list(this.userId).subscribe({
      next: rows => {
        this.plantas = rows;
        this.loading = false;
      },
      error: err => {
        this.error = 'No se pudieron cargar tus plantas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openCreate() {
    this.editing = null;
    this.form = {
      common_name: '',
      nickname: '',
      location: '',
      light: '',
      humidity: '',
      notes: ''
    };
    this.formImageFile = null;
    this.formImagePreview = null;
    this.formOpen = true;
  }

  openEdit(p: Plant) {
    this.editing = p;
    this.form = {
      common_name: p.common_name || '',
      nickname: p.nickname || '',
      location: p.location || '',
      light: p.light || '',
      humidity: p.humidity || '',
      notes: p.notes || ''
    };
    // preview inicial: la imagen actual de la planta (o placeholder)
    this.formImageFile = null;
    this.formImagePreview = this.getPlantImage(p);
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.formImageFile = null;
    this.formImagePreview = null;
  }

  // 🔸 NUEVO: cambio de foto en el formulario
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    this.formImageFile = file;

    const reader = new FileReader();
    reader.onload = e => {
      this.formImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveForm() {
    if (!this.userId) return;

    const afterSave = () => {
      this.formOpen = false;
      this.formImageFile = null;
      this.formImagePreview = null;
      this.fetch();
    };

    if (this.editing) {
      this.plantSvc
        .patch(this.editing.id, {
          common_name: this.form.common_name,
          nickname: this.form.nickname,
          location: this.form.location,
          light: this.form.light,
          humidity: this.form.humidity,
          notes: this.form.notes
        })
        .subscribe({
          next: updatedPlant => {
            // si hay nueva foto → subirla
            if (this.formImageFile) {
              this.plantSvc.uploadImage(updatedPlant.id, this.formImageFile).subscribe({
                next: () => afterSave(),
                error: e => {
                  console.error('No se pudo subir foto', e);
                  afterSave();
                }
              });
            } else {
              afterSave();
            }
          },
          error: e => console.error('No se pudo actualizar', e)
        });
    } else {
      if (!this.form.common_name.trim()) {
        alert('Nombre común es obligatorio');
        return;
      }
      this.plantSvc
        .create({
          user_id: this.userId,
          common_name: this.form.common_name.trim(),
          nickname: this.form.nickname || undefined,
          location: this.form.location || undefined,
          light: this.form.light || undefined,
          humidity: this.form.humidity || undefined,
          notes: this.form.notes || undefined,
          source: 'manual'
        })
        .subscribe({
          next: createdPlant => {
            if (this.formImageFile) {
              this.plantSvc.uploadImage(createdPlant.id, this.formImageFile).subscribe({
                next: () => afterSave(),
                error: e => {
                  console.error('No se pudo subir foto', e);
                  afterSave();
                }
              });
            } else {
              afterSave();
            }
          },
          error: e => console.error('No se pudo crear', e)
        });
    }
  }

  archive(p: Plant) {
    if (!confirm(`¿Archivar "${p.common_name}"?`)) return;
    this.plantSvc.archive(p.id).subscribe({
      next: () => this.fetch(),
      error: e => console.error('No se pudo archivar', e)
    });
  }

  openDetail(p: Plant) {
    this.router.navigate(['/mis-plantas', p.id]);
  }

  getPlantImage(p: Plant): string {
    const uri = p.image_gcs_uri;
    if (!uri) {
      return this.placeholderImage;
    }

    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }

    if (uri.startsWith('gs://')) {
      const withoutScheme = uri.slice(5); 
      const slashIdx = withoutScheme.indexOf('/');
      if (slashIdx === -1) return this.placeholderImage;

      const bucket = withoutScheme.slice(0, slashIdx);
      const path = withoutScheme.slice(slashIdx + 1);
      return `https://storage.googleapis.com/${bucket}/${path}`;
    }

    return this.placeholderImage;
  }
}
