import { Component, HostListener, OnInit } from '@angular/core';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WishlistPlant {
  id: number;
  name: string;
  reason?: string;
  priority: 'alta' | 'media' | 'baja';
  dateAdded: Date;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    BarraInferiorComponent,
    BarraSuperiorComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistPlants: WishlistPlant[] = [];
  formOpen = false;
  
  newPlant = {
    name: '',
    reason: '',
    priority: 'media' as 'alta' | 'media' | 'baja'
  };

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    // Datos de ejemplo - en producción vendrían de un servicio
    this.wishlistPlants = [
      {
        id: 1,
        name: 'Monstera Deliciosa',
        reason: 'Me encanta su follaje grande y tropical, perfecta para mi sala',
        priority: 'alta',
        dateAdded: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Ficus Lyrata',
        reason: 'Quiero una planta grande para el rincón del comedor',
        priority: 'media',
        dateAdded: new Date('2024-02-20')
      },
      {
        id: 3,
        name: 'Calathea Orbifolia',
        reason: 'Sus hojas rayadas son hermosas',
        priority: 'baja',
        dateAdded: new Date('2024-03-10')
      },
      {
        id: 4,
        name: 'Alocasia Polly',
        reason: 'Me gustan sus hojas con forma de flecha',
        priority: 'media',
        dateAdded: new Date('2024-03-25')
      }
    ];
  }

  toggleForm() {
    this.formOpen = !this.formOpen;
    if (!this.formOpen) {
      this.resetForm();
    }
  }

  addToWishlist() {
    if (!this.newPlant.name.trim()) {
      alert('Por favor ingresa el nombre de la planta');
      return;
    }

    const plant: WishlistPlant = {
      id: Date.now(),
      name: this.newPlant.name.trim(),
      reason: this.newPlant.reason.trim() || undefined,
      priority: this.newPlant.priority,
      dateAdded: new Date()
    };

    this.wishlistPlants.unshift(plant);
    this.toggleForm();
  }

  resetForm() {
    this.newPlant = {
      name: '',
      reason: '',
      priority: 'media'
    };
  }

  removePlant(plant: WishlistPlant) {
    const confirmed = confirm(`¿Eliminar "${plant.name}" de tu wishlist?`);
    if (confirmed) {
      this.wishlistPlants = this.wishlistPlants.filter(p => p.id !== plant.id);
    }
  }

  markAsObtained(plant: WishlistPlant) {
    const confirmed = confirm(`¿Ya conseguiste "${plant.name}"? Se eliminará de tu wishlist.`);
    if (confirmed) {
      this.wishlistPlants = this.wishlistPlants.filter(p => p.id !== plant.id);
      // Aquí podrías agregar lógica para mover la planta a "Mis Plantas"
      alert(`¡Felicidades por conseguir tu ${plant.name}! 🎉`);
    }
  }

  getPriorityLabel(priority: string): string {
    const labels = {
      'alta': 'Alta',
      'media': 'Media',
      'baja': 'Baja'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInsideForm = !!target.closest('.add-form-popup');
    const clickedAddButton = !!target.closest('.add-btn');

    if (this.formOpen && !clickedInsideForm && !clickedAddButton) {
      this.formOpen = false;
      this.resetForm();
    }
  }
}
