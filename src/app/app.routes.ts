import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { About } from './shared/presentation/views/about/about';
import { Support } from './shared/presentation/views/support/support';
import { PageNotFound } from './shared/presentation/views/page-not-found/page-not-found';
import {relativesRoutes} from "./relatives/presentation/relative.routes";

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: '', redirectTo: 'doctor-list', pathMatch: 'full' },
            { path: 'support', component: Support },
            { path: 'about', component: About },
        ]
    },
    ...relativesRoutes  ,
    { path: '**', component: PageNotFound }
];