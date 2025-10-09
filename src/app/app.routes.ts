import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { About } from './shared/presentation/views/about/about';
import { Support } from './shared/presentation/views/support/support';
import { PageNotFound } from './shared/presentation/views/page-not-found/page-not-found';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      // Ruta predeterminada
      { path: '', redirectTo: 'doctor-list', pathMatch: 'full' },
        /*
      // Rutas principales
      { path: 'doctor-list', component: DoctorList },
      { path: 'patients-list', component: PatientsList },
       */
      { path: 'support', component: Support },
      { path: 'about', component: About },
                  
      // Página no encontrada
      { path: '**', component: PageNotFound }
    ]
  }
];
