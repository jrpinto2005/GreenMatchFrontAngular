import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BarraSuperiorComponent,
    BarraInferiorComponent
  ],
  templateUrl: './mi-horario.component.html',
  styleUrls: ['./mi-horario.component.scss']
})
export class MiHorarioComponent {}