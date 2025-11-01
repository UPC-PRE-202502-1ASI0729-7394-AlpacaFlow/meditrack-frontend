import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';

const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const support = () => import('./shared/presentation/views/support/support').then(m => m.Support);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

const baseTitle = 'MediTrack';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'organization',
    pathMatch: 'full'
  },
  {
    path: '',
    component: Layout,
    children: [
        /*
        {
        path: 'relative',
        loadChildren: () =>
            import('./relatives/presentation/relative.routes').then(m => m.relativesRoutes)

      },
         */
      {
        path: 'organization',
        loadChildren: () =>
            import('./organization/presentation/organization.routes').then(m => m.organizationRoutes)
      }
    ]

  },
  {
    path: '**',
    loadComponent: pageNotFound,
    data: { title: `${baseTitle} - Page Not Found` }
  }
];