import { Component, HostListener, OnInit } from '@angular/core';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Plant {
  id?: number;
  name?: string;
  watered?: number;
}

@Component({
  selector: 'mis-plantas',
  standalone: true,
  imports: [
    BarraInferiorComponent,
    BarraSuperiorComponent,
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './mis-plantas.component.html',
  styleUrls: ['./mis-plantas.component.scss']
})
export class MisPlantasComponent implements OnInit {

  plantas: Plant[] = [];
  popupOpen = false;
  formOpen = false;

  newPlant = {
    name: '',
    watered: 0
  };

  constructor(private http: HttpClient) { }

  togglePopup() {
    this.popupOpen = !this.popupOpen;
  }

  closePopup() {
    this.popupOpen = false;
  }

  openAddPlantForm() {
    this.closePopup();
    this.formOpen = true;
    this.resetForm();
  }

  closeForm() {
    this.formOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.newPlant = {
      name: '',
      watered: 0
    };
  }

  addPlant() {
    if (!this.newPlant.name.trim()) {
      alert('Por favor ingresa el nombre de la planta');
      return;
    }

    const plant: Plant = {
      id: Date.now(),
      name: this.newPlant.name.trim(),
      watered: this.newPlant.watered || 0
    };

    this.plantas.unshift(plant);
    this.closeForm();
    
    // Aquí podrías agregar lógica para guardar en el backend o localStorage
    console.log('Planta agregada:', plant);
  }

  removePlant(plant: Plant) {
    const confirmed = confirm(`¿Eliminar "${plant.name}" de tus plantas?`);
    if (confirmed) {
      this.plantas = this.plantas.filter(p => p.id !== plant.id);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInsidePopup = !!target.closest('.popup-menu');
    const clickedInsideForm = !!target.closest('.add-plant-panel');
    const clickedAddButton = !!target.closest('.add-btn');

    if (this.popupOpen && !clickedInsidePopup && !clickedAddButton && !clickedInsideForm) {
      this.popupOpen = false;
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