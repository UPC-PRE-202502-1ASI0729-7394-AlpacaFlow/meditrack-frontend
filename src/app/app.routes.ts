import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';


export const routes: Routes = [

    {
    path: '',
    component: Layout,
    children: [
      // Ruta predeterminada

      /*
      { path: '', redirectTo: 'doctor-list', pathMatch: 'full' },
      { path: 'doctor-list', component: DoctorList },
      { path: 'doctor-detail/:id', component: DoctorDetail },
      { path: 'patient-list', component: PatientListComponent },
      { path: 'patient-detail/:id', component: PatientDetail},
      { path: 'support', component: Support },
      { path: 'about', component: About },
       */
        {
            path: 'relative',
            loadChildren: () =>
                import('./relatives/presentation/relative.routes').then(m => m.relativesRoutes)
        },
    ]

  },

];
