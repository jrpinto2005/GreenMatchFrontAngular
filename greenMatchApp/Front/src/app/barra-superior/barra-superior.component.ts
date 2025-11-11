import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [],
  templateUrl: './barra-superior.component.html',
  styleUrls: ['./barra-superior.component.scss']
})
export class BarraSuperiorComponent {

  @Output() toggleSideBar = new EventEmitter<void>();

  onToggleMenu() {
    this.toggleSideBar.emit();
    //console.log("button has been clicked!!!!")
    //recuerda add auth guard to chat page in routes
  }

}
