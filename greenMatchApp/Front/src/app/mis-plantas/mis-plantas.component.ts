import { Component, OnInit } from '@angular/core';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mis-plantas',
  standalone: true,
  imports: [BarraInferiorComponent, 
            BarraSuperiorComponent, 
            CommonModule],
  templateUrl: './mis-plantas.component.html',
  styleUrls: ['./mis-plantas.component.scss'],
})
export class MisPlantasComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
