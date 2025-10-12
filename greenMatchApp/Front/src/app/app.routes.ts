import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { MisPlantasComponent } from './mis-plantas/mis-plantas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent },
  {path: 'mis-plantas', component: MisPlantasComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
