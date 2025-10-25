import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface LandingHighlight {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  readonly highlights: LandingHighlight[] = [
    {
      title: 'Cuida tus plantas',
      description: 'Recordatorios inteligentes para riegos, fertilizaciones y podas.',
      icon: '01'
    },
    {
      title: 'Conecta con la comunidad',
      description: 'Chat verde para resolver dudas y compartir avances.',
      icon: '02'
    },
    {
      title: 'Agenda visual',
      description: 'Un calendario claro para organizar cada cuidado.',
      icon: '03'
    }
  ];
}
