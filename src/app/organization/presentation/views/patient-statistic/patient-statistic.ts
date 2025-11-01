import {Component, computed, inject, OnInit, OnDestroy} from '@angular/core';
import {OrganizationStore} from "../../../application/organization.store";
import {BloodPressure} from "../../components/blood-pressure/blood-pressure";
import {HeartRate} from "../../components/heart-rate/heart-rate";
import {OxygenSaturation} from "../../components/oxygen-saturation/oxygen-saturation";
import {TemperatureRate} from "../../components/temperature-rate/temperature-rate";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-patient-statistic',
  standalone: true,
  imports: [
    BloodPressure,
    HeartRate,
    OxygenSaturation,
    TemperatureRate
  ],
  templateUrl: './patient-statistic.html',
  styleUrl: './patient-statistic.css'
})
export class PatientStatistic implements OnInit, OnDestroy {

    private organizationStore = inject(OrganizationStore);
    private route = inject(ActivatedRoute);
    private routeSubscription?: Subscription;

    patient = computed(() => this.organizationStore.selectedPatient())

    bloodPressure = computed<[number, number][]>(() => {
        const bp = this.patient()?.signalVitals?.bloodPressure;
        if (!bp) return [];
        return bp.map(arr => [arr[0] ?? 0, arr[1] ?? 0] as [number, number]);
    });

    heartRate = computed<number[]>(
        () => this.patient()?.signalVitals?.heartRate ?? []);

    oxigenLevel = computed<any[]>(
        () => this.patient()?.signalVitals?.oxygenLevel ?? []);

    temperature = computed<number[]>(
        () => this.patient()?.signalVitals?.temperature ?? []);

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
            console.log(`📊 PatientStatistic: Loading patient ${patientId}`);
            this.organizationStore.loadPatientById(Number(patientId));
        }
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }
}

