import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface LandingHighlight {
  title: string;
  description: string;
  icon: string;
}

interface UserPersona {
  emoji: string;
  title: string;
  description: string;
}

interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

interface CompetitiveAdvantage {
  icon: string;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface RealTestimonial {
  name: string;
  rating: string;
  content: string;
  liked: string;
  improved?: string;
}

interface ComparisonFeature {
  feature: string;
  greenMatch: boolean;
  others: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  readonly showAllTestimonials = signal(false);

  readonly highlights: LandingHighlight[] = [
    {
      title: 'Cuida tus plantas con IA',
      description: 'Sube una foto o descríbela y nuestro chat te dirá qué planta es, qué necesita y cómo debes cuidarla.',
      icon: '01'
    },
    {
      title: 'Plan personalizado siempre disponible',
      description: 'Recibe un plan de riego, luz y fertilización hecho para tu planta. Consúltalo cuando quieras desde tu calendario o perfil.',
      icon: '02'
    },
    {
      title: 'Pregunta cualquier duda en el chat verde',
      description: 'Nuestra IA generativa responde sobre riegos, podas, problemas de hojas, iluminación y más con base en tus fotos y espacio.',
      icon: '03'
    },
    {
      title: 'Wishlist de plantas (próximamente)',
      description: 'Guarda las plantas que quieras tener en el futuro y recibe notificaciones.',
      icon: '04'
    }
  ];

  readonly personas: UserPersona[] = [
    {
      emoji: '🧳',
      title: 'El foráneo',
      description: 'Su conocimiento sobre plantas no viajó con él'
    },
    {
      emoji: '🌱',
      title: 'El novato',
      description: 'Ama la idea de un hogar verde, pero se siente abrumado por la información'
    },
    {
      emoji: '⏰',
      title: 'El ocupado',
      description: 'Quiere los beneficios de la naturaleza, pero no tiene tiempo para un nuevo hobby'
    },
    {
      emoji: '👩',
      title: 'La mamá',
      description: 'Quiere agregarle un poco más de vida a la casa'
    },
    {
      emoji: '😵‍💫',
      title: 'El olvidadizo',
      description: 'Ama sus plantas… pero siempre se acuerda cuando ya es tarde.'
    },
    {
      emoji: '💧',
      title: 'El regador compulsivo',
      description: 'Piensa que más agua es igual a más amor… pero siempre las ahoga.'
    }
  ];

  readonly howItWorks: HowItWorksStep[] = [
    {
      number: '01',
      title: 'Chatea y envía tus fotos',
      description: 'Describe tu planta, tu espacio y tu clima, o simplemente sube una foto: nuestro chat entiende lo que necesita.'
    },
    {
      number: '02',
      title: 'IA analiza',
      description: 'Nuestra IA generativa analiza luz, clima, tamaño y estado general para darte recomendaciones útiles para que viva más tiempo.'
    },
    {
      number: '03',
      title: 'Guía personalizada',
      description: 'Recibe un plan claro de riego, luz y fertilización pensando en tu día a día. Accede a él cuando quieras.'
    },
    {
      number: '04',
      title: 'Compra fácil (Coming Soon)',
      description: 'Te mostraremos viveros y plantas compatibles cuando la función esté disponible.'
    }
  ];

  readonly advantages: CompetitiveAdvantage[] = [
    {
      icon: '🎯',
      title: 'Más personalizado',
      description: 'Recomendaciones según tu espacio, clima y estilo de vida'
    },
    {
      icon: '⚡',
      title: 'Más rápido',
      description: 'Contacto inmediato con viveros locales'
    },
    {
      icon: '✨',
      title: 'Más sencillo',
      description: 'Todo en una sola app: descubre, compra y cuida'
    }
  ];

  readonly realTestimonials: RealTestimonial[] = [
    {
      name: 'Alicia López',
      rating: '10/10',
      content: 'Me encantaron las recomendaciones personalizadas para mi ciudad y los tips extra, por eso le doy un 10. La aplicación fue muy fácil de usar. Lo único que mejoraría sería la parte de la fertilización, que podría estar más explicada.',
      liked: 'Lo que más me gustó fueron las recomendaciones personalizadas para la ciudad en donde vivo y los tips extra.',
      improved: 'Fácil de usar, muy dispuesta a seguir usándolo.'
    },
    {
      name: 'Ana Sofía',
      rating: '8/10',
      content: 'Me pareció muy fácil de usar y las instrucciones fueron claras. Lo que me confundió un poco fue la parte de fertilización, porque en mi ciudad no hay estaciones como primavera o verano.',
      liked: 'Me gustó lo rápido y personalizado a mi planta que fue la respuesta.',
      improved: 'Me pareció fácil de hacer, son instrucciones muy claras y estoy dispuesta a probarlo.'
    },
    {
      name: 'Silvana Barbosa',
      rating: '8/10',
      content: 'Me pareció una herramienta muy útil para cuidar bien mi planta. Todo fue fácil de entender y aplicar, y los recordatorios ayudan mucho a mantener la constancia.',
      liked: 'La información es práctica, concreta y fácil de seguir. Los tips adicionales como limpiar hojas, rotar la planta y buen drenaje son muy útiles.',
      improved: 'Los recordatorios en el calendario hacen que sea más fácil mantener la rutina.'
    },
    {
      name: 'Juanita García',
      rating: '8.5/10',
      content: 'Me gustó mucho porque me ayudó a entender cómo cuidar mi planta y hasta supe cómo se llamaba. Fue fácil de seguir, aunque me confundí un poco con la parte de la fertilización. Me gustaría que además del correo hubiera otra forma de recibir la información, como un chat o recordatorio directo.',
      liked: 'Me gustó que fuera tan personalizado y claro.',
      improved: 'Fue fácil de seguir. Estoy dispuesta a hacerlo.'
    },
    {
      name: 'Daniel Machuca',
      rating: '7.5/10',
      content: 'El proceso me pareció sencillo y las recomendaciones útiles. No tuve confusión con la idea, aunque me molestó un poco que no pudiera mandar la foto directamente desde la galería. Me gustó que identificara bien mi planta y que las sugerencias fueran acertadas. Lo único fue que me decía cosas específicas de Medellín, pero yo no vivo allá. En general, sí me aportó valor con tips que no conocía.',
      liked: 'El proceso es sencillo: mandas la foto y al poco tiempo recibes recomendaciones claras. Me dio tips que no conocía como el uso de fertilizante.',
      improved: 'Me pareció fácil, aunque adjuntar la foto fue un poco molesto. Aun así estaría dispuesto a hacerlo otra vez.'
    },
    {
      name: 'Jaime Ignacio',
      rating: '7/10',
      content: 'Me pareció fácil de usar, aunque creo que las instrucciones podrían ser más claras, sobre todo para alguien que no sabe nada de plantas. Lo que más me gustó fue la explicación y el recordatorio en el calendario para no olvidar regar o abonar. Sin embargo, me gustaría que la información no llegara solo por correo, sino a través de un chat o algo más interactivo.',
      liked: 'Lo que más me gustó es la explicación y los recordatorios para que no se me olvide regar o abonar las plantas.',
      improved: 'Me pareció fácil de hacer.'
    },
    {
      name: 'Leonardo Ramírez',
      rating: '8/10',
      content: 'Me pareció una herramienta práctica y rápida de entender. Fue fácil de leer, aunque algunas cosas, como lo del ‘sustrato’, no las conocía. Creo que la app asume que uno ya sabe sobre plantas. De resto, me gustó que fuera concisa y clara.',
      liked: 'Lo que más me gustó fue que fue conciso y fácil de leer.',
      improved: 'Fue fácil de leer y rápido de buscar lo que no sabía.'
    },
    {
      name: 'María Consuelo',
      rating: '7/10',
      content: 'El resultado fue justo lo que esperaba, me gustó bastante. Al principio no estaba muy segura de cuánta información debía dar, pero fue sencillo. Lo único es que me ubicó en Medellín y yo estoy en Barranquilla.',
      liked: 'Normal, muy dispuesta a usarlo.',
      improved: 'El proceso fue sencillo.'
    }
  ];

  readonly comparisonFeatures: ComparisonFeature[] = [
    { feature: 'Recomendación personalizada con IA', greenMatch: true, others: false },
    { feature: 'Compra directa en viveros locales', greenMatch: true, others: false },
    { feature: 'Recordatorios inteligentes de cuidado', greenMatch: true, others: true },
    { feature: 'Wishlist para plantas futuras', greenMatch: true, others: false },
    { feature: 'Adaptado a tu clima local específico', greenMatch: true, others: false },
    { feature: 'Guía paso a paso personalizada', greenMatch: true, others: true }
  ];

  readonly faqs: FAQ[] = [
    {
      question: '¿Necesito experiencia previa con plantas?',
      answer: 'No. GreenMatch está diseñado especialmente para principiantes y personas que han fallado antes. Nuestra IA te guía paso a paso.'
    },
    {
      question: '¿Funciona para cualquier clima?',
      answer: 'Sí. Nuestro sistema adapta las recomendaciones según tu ubicación y condiciones específicas. Funcionamos en toda Latinoamérica.'
    },
    {
      question: '¿Cómo me ayuda con la compra?',
      answer: 'Te conectamos directamente con viveros locales verificados que tienen las plantas recomendadas para ti. Algunos ofrecen descuentos exclusivos.'
    },
    {
      question: '¿GreenMatch es gratis?',
      answer: 'Sí, GreenMatch es completamente gratuito. Puedes usar todas las funciones sin costo alguno.'
    },
    {
      question: '¿Qué es la wishlist de plantas?',
      answer: 'Es una función que te permite guardar las plantas que deseas comprar en el futuro. Recibirás notificaciones cuando estén disponibles en viveros cercanos.'
    },
    {
      question: '¿Cómo funcionan los recordatorios?',
      answer: 'Una vez que agregas una planta, GreenMatch crea un calendario personalizado con recordatorios para riego, fertilización y otros cuidados específicos para tu planta y clima.'
    }
  ];

  readonly trustBadges = [
    { text: '✅ 100% Gratuito', subtitle: 'Sin costos ocultos' },
    { text: '💚 Sin permanencia', subtitle: 'Usa cuando lo necesites' },
    { text: '🇨🇴 Hecho en Colombia', subtitle: 'Soporte en español 24/7' }
  ];

  toggleTestimonials(): void {
    this.showAllTestimonials.update(value => !value);
  }

  getVisibleTestimonials(): RealTestimonial[] {
    return this.showAllTestimonials() 
      ? this.realTestimonials 
      : this.realTestimonials.slice(0, 4);
  }
}