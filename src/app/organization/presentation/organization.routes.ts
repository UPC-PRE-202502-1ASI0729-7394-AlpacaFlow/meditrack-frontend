import { Routes } from '@angular/router';

const organizationLayout = () =>
    import('./views/organization-layout/organization-layout').then(m => m.OrganizationLayout);
const doctorList = () =>
    import('./views/doctor-list/doctor-list').then(m => m.DoctorList);
const doctorDetail = () =>
    import('./views/doctor-detail/doctor-detail').then(m => m.DoctorDetail);
const patientList = () =>
    import('./views/patient-list/patient-list').then(m => m.PatientListComponent);
const patientDetail = () =>
    import('./views/patient-detail/patient-detail').then(m => m.PatientDetail);
const patientAlertList = () =>
    import('./views/patient-alert-list/patient-alert-list').then(m => m.PatientAlertList);
const patientStatistic = () =>
    import('./views/patient-statistic/patient-statistic').then(m => m.PatientStatistic);
const keeperList = () =>
    import('./views/keeper-list/keeper-list').then(m => m.KeeperListComponent);
const keeperDetail = () =>
    import('./views/keeper-detail/keeper-detail').then(m => m.KeeperDetail);
const seniorCitizenList = () =>
    import('./views/senior-citizen-list/senior-citizen-list').then(m => m.SeniorCitizenListComponent);
const seniorCitizenDetail = () =>
    import('./views/senior-citizen-detail/senior-citizen-detail').then(m => m.SeniorCitizenDetail);
const seniorCitizenAlertList = () =>
    import('./views/senior-citizen-alert-list/senior-citizen-alert-list').then(m => m.SeniorCitizenAlertList);
const seniorCitizenStatistic = () =>
    import('./views/senior-citizen-statistic/senior-citizen-statistic').then(m => m.SeniorCitizenStatistic);
const support = () =>
    import('./views/support/support').then(m => m.Support);

export const organizationRoutes: Routes = [

    {
        path: ':id',
        loadComponent: organizationLayout,
        children: [
            { path: 'doctors', loadComponent: doctorList, data: { title: 'Doctors' } },
            { path: 'doctors/:id', loadComponent: doctorDetail, data: { title: 'Doctor Detail' } },
            { path: 'patients', loadComponent: patientList, data: { title: 'Patients' } },
            { path: 'patients/:patientId/profile', loadComponent: patientDetail, data: { title: 'Patient Profile' } },
            { path: 'patients/:patientId/alerts', loadComponent: patientAlertList, data: { title: 'Patient Alerts' } },
            { path: 'patients/:patientId/statistics', loadComponent: patientStatistic, data: { title: 'Patient Statistics' } },
            { path: 'patients/:patientId', redirectTo: 'patients/:patientId/profile', pathMatch: 'full' },
            { path: 'keepers', loadComponent: keeperList, data: { title: 'Keepers' } },
            { path: 'keepers/:id', loadComponent: keeperDetail, data: { title: 'Keeper Detail' } },
            { path: 'senior-citizens', loadComponent: seniorCitizenList, data: { title: 'Senior Citizens' } },
            { path: 'senior-citizens/:id/profile', loadComponent: seniorCitizenDetail, data: { title: 'Senior Citizen Profile' } },
            { path: 'senior-citizens/:id/alerts', loadComponent: seniorCitizenAlertList, data: { title: 'Senior Citizen Alerts' } },
            { path: 'senior-citizens/:id/statistics', loadComponent: seniorCitizenStatistic, data: { title: 'Senior Citizen Statistics' } },
            { path: 'senior-citizens/:id', redirectTo: 'senior-citizens/:id/profile', pathMatch: 'full' },
            { path: 'support', loadComponent: support, data: { title: 'Support' } }
        ]
    }
];
