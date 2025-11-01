import {Component, computed, inject, OnInit, OnDestroy} from '@angular/core';
import {OrganizationStore} from "../../../application/organization.store";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-patient-alert-list',
  standalone: true,
  imports: [
    MatCardContent,
    MatCardTitle,
    MatCardHeader,
    MatCard,
    TranslatePipe
  ],
  templateUrl: './patient-alert-list.html',
  styleUrl: './patient-alert-list.css'
})
export class PatientAlertList implements OnInit, OnDestroy {

    private organizationStore = inject(OrganizationStore);
    private route = inject(ActivatedRoute);
    private routeSubscription?: Subscription;

    patient = computed(() => this.organizationStore.selectedPatient());

    ngOnInit() {
        // Load patient on init
        this.loadPatient();
        
        // Subscribe to route changes to reload patient when navigating between different patients
        this.routeSubscription = this.route.paramMap.subscribe(params => {
            const patientId = params.get('patientId');
            if (patientId) {
                this.loadPatient();
            }
        });
    }

    private loadPatient(): void {
        const patientId = this.route.snapshot.paramMap.get('patientId');
        if (patientId) {
            console.log(`🚨 PatientAlertList: Loading patient ${patientId}`);
            this.organizationStore.loadPatientById(Number(patientId));
        }
    }

    formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }
}

