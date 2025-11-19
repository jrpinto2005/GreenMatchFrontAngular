import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-barra-inferior',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './barra-inferior.component.html',
  styleUrls: ['./barra-inferior.component.scss'],
})
export class BarraInferiorComponent {
  isCollapsed = true;

  @Output() collapsedChange = new EventEmitter<boolean>();

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
