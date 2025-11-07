import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { MisPlantasComponent } from './mis-plantas/mis-plantas.component';
import { MiHorarioComponent } from './mi-horario/mi-horario.component';
import { LandingComponent } from './landing/landing.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'mis-plantas', component: MisPlantasComponent, canActivate: [authGuard] },
  { path: 'mi-horario', component: MiHorarioComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
