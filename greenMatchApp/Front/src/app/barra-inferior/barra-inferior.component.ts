import { Component, HostBinding, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-barra-inferior',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-inferior.component.html',
  styleUrls: ['./barra-inferior.component.scss']
})
export class BarraInferiorComponent {
  @HostBinding('class.barra-inferior--hidden')
  isHidden = false;

  private lastScrollY = 0;
  private readonly deltaThreshold = 6;
  private readonly hasDom = typeof window !== 'undefined' && typeof document !== 'undefined';

  @HostListener('window:scroll')
  handleScroll(): void {
    if (!this.hasDom) {
      return;
    }
    const current = window.scrollY || 0;
    const delta = current - this.lastScrollY;

    if (current < 60) {
      this.isHidden = false;
      this.lastScrollY = current;
      return;
    }

    if (delta > this.deltaThreshold) {
      this.isHidden = true;
    } else if (delta < -this.deltaThreshold) {
      this.isHidden = false;
    }

    const nearBottom =
      window.innerHeight + current >= document.body.offsetHeight - 96;
    if (nearBottom) {
      this.isHidden = false;
    }

    this.lastScrollY = current;
  }

}
