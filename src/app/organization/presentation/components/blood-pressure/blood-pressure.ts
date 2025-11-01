import {Component, Input, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject} from '@angular/core';
import { Chart, ChartConfiguration, ChartTypeRegistry, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import {TranslateService} from "@ngx-translate/core";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
    selector: 'app-blood-pressure',
    standalone: true,
    template: `<canvas #chartCanvas height="300"></canvas>`,
    styleUrls: ['./blood-pressure.css']
})
export class BloodPressure implements AfterViewInit, OnDestroy {

    private translateService = inject(TranslateService);

    @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

    @Input() bloodPressure: [number, number][] = [];
    private chartInstance?: Chart<keyof ChartTypeRegistry, (number | [number, number] | null)[], unknown>;

    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    ngAfterViewInit() {
        this.initChart();
    }

    ngOnDestroy() {
        this.chartInstance?.destroy();
    }

    private initChart() {
        if (!this.chartCanvas) return;

        const ctx = this.chartCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        const bloodPressureLabel = this.translateService.instant('patient.statistics.bloodPressure');
        const bloodPressureTitle = this.translateService.instant('patient.statistics.bloodPressureTitle');
        const diastolicLabel = this.translateService.instant('patient.statistics.diastolic');
        const systolicLabel = this.translateService.instant('patient.statistics.systolic');
        const mmhgLabel = this.translateService.instant('patient.statistics.mmhg');

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: bloodPressureLabel,
                        data: this.bloodPressure,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: bloodPressureTitle
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                const val = context.raw as [number, number];
                                return `${diastolicLabel}: ${val[0]}, ${systolicLabel}: ${val[1]}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 60,
                        suggestedMax: 140,
                        title: { display: true, text: mmhgLabel }
                    }
                }
            }
        });
    }

    ngOnChanges() {
        if (this.chartInstance) {
            this.chartInstance.data.datasets[0].data = this.bloodPressure ?? [];
            this.chartInstance.update();
        }
    }
}

