import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { MisPlantasComponent } from './mis-plantas/mis-plantas.component';
import { MiHorarioComponent } from './mi-horario/mi-horario.component';
import { LandingComponent } from './landing/landing.component';
import { AddPlantComponent } from './add-plant/add-plant.component';
import { RecommendPlantComponent } from './recommend-plant/recommend-plant.component';
import { authGuard } from './auth/auth.guard';
import { WishlistComponent } from './wishlist/wishlist.component';
import { PlantDetailComponent } from './mis-plantas/plant-detail/plant-detail.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'mis-plantas', component: MisPlantasComponent, canActivate: [authGuard] },
  { path: 'mis-plantas/:id', component: PlantDetailComponent, canActivate: [authGuard] },
  { path: 'mi-horario', component: MiHorarioComponent, canActivate: [authGuard] },
  { path: 'add', component: AddPlantComponent, canActivate: [authGuard] },
  { path: 'recommend', component: RecommendPlantComponent, canActivate: [authGuard]},
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
