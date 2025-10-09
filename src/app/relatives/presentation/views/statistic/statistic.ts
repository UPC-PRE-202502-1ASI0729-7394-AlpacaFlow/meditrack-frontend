import {Component, computed, inject} from '@angular/core';
import {RelativesStore} from "../../../application/relatives.store";
import {BloodPreasure} from "../../components/blood-preasure/blood-preasure";
import {HeartRate} from "../../components/hear-rate/hear-rate";
import {OxygenSaturation} from "../../components/oxigen-saturation/oxigen-saturation";
import {TemperatureRate} from "../../components/temperature-rate/temperature-rate";

@Component({
  selector: 'app-statistic',
    imports: [
        BloodPreasure,
        HeartRate,
        OxygenSaturation,
        TemperatureRate
    ],
  templateUrl: './statistic.html',
  styleUrl: './statistic.css'
})
export class Statistic {

    private relativeStore = inject(RelativesStore)

    relative = computed(() => this.relativeStore.selectedRelative())

    bloodPressure = computed<[number, number][]>(() => {
        const bp = this.relative()?.seniorCitizen?.signalVitals?.bloodPressure;
        if (!bp) return [];
        return bp.map(arr => [arr[0] ?? 0, arr[1] ?? 0] as [number, number]);
    });


    heartRate = computed<number[]>(
        () => this.relative()?.seniorCitizen?.signalVitals?.heartRate ?? []);

    oxigenLevel = computed<any[]>(
        () => this.relative()?.seniorCitizen?.signalVitals?.oxygenLevel ?? []);

    temperature = computed<number[]>(
        () => this.relative()?.seniorCitizen?.signalVitals?.temperature ?? []);



    ngOnInit() {
        this.relativeStore.loadRelativeById()
    }
}
