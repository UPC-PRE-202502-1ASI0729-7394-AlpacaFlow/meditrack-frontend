import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { Patient } from '../domain/model/patient.entity';
import { PatientResource, PatientsResponse } from './patient-response';
import { PatientsAssembler } from './patient-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * API endpoint para la gestión de pacientes.
 */
@Injectable({
    providedIn: 'root'
})
export class PatientsApiEndpoint extends BaseApiEndpoint<
    Patient,
    PatientResource,
    PatientsResponse,
    PatientsAssembler
> {
    constructor(http: HttpClient) {
        super(
            http,
            `${environment.platformProviderApiBaseUrl}${environment.platformProviderPatientsEndpointPath}`,
            new PatientsAssembler()
        );
    }


    /**
     * Obtiene pacientes por organizationId
     */
    getByOrganizationId(organizationId: number) {
        return this.http.get<PatientsResponse>(`${this.endpointUrl}?organizationId=${organizationId}`)
            .pipe(
                // @ts-ignore
                map(response => this.assembler.toEntitiesFromResponse(response))
            );
    }

    /**
     * Obtiene pacientes por doctorId
     */
    getByDoctorId(doctorId: number) {
        return this.http.get<PatientsResponse>(`${this.endpointUrl}?doctorId=${doctorId}`)
            .pipe(
                // @ts-ignore
                map(response => this.assembler.toEntitiesFromResponse(response))
            );
    }
}