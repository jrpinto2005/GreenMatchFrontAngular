import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-barra-inferior',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-inferior.component.html',
  styleUrls: ['./barra-inferior.component.scss']
})
export class BarraInferiorComponent {
  // Estado de barra colapsada (solo se ve el “tirador”)
  @HostBinding('class.barra-inferior--collapsed')
  isCollapsed = false;

  // Por si el padre (chat) quiere reaccionar a este estado
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
