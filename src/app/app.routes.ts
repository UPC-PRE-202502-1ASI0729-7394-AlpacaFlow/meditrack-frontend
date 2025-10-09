import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { About } from './shared/presentation/views/about/about';
import { Support } from './shared/presentation/views/support/support';
import { PageNotFound } from './shared/presentation/views/page-not-found/page-not-found';
import {relativesRoutes} from "./relatives/presentation/relative.routes";
import { DoctorList } from './organization/presentation/views/doctor-list/doctor-list';
import { DoctorDetail } from './organization/presentation/views/doctor-detail/doctor-detail';
import {PatientListComponent} from "./organization/presentation/views/patient-list/patient-list";
import {PatientDetail} from "./organization/presentation/views/patient-detail/patient-detail";

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      // Ruta predeterminada
      { path: '', redirectTo: 'doctor-list', pathMatch: 'full' },
      { path: 'doctor-list', component: DoctorList },
      { path: 'doctor-detail/:id', component: DoctorDetail },
      { path: 'patient-list', component: PatientListComponent },
      {path: 'patient-detail/:id', component: PatientDetail},
      { path: 'support', component: Support },
      { path: 'about', component: About },
      ...relativesRoutes,       
      // Página no encontrada
      { path: '**', component: PageNotFound }
    ]
  }
];
