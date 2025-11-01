import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { Patient } from '../domain/model/patient.entity';
import { PatientResource, PatientsResponse } from './patient-response';
import { PatientsAssembler } from './patient-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

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
            const url = `${this.endpointUrl}?organizationId=${organizationId}`;
            console.log(`🌐 [API] Requesting patients from: ${url}`);
            return this.http.get<PatientsResponse | PatientResource[]>(url)
                .pipe(
                    map(response => {
                        console.log(`📦 [API] Raw response from server:`, response);
                        // Manejar tanto arrays directos (JSON Server) como objetos con campo patients
                        if (Array.isArray(response)) {
                            console.log(`📦 [API] Response is an array, mapping directly`);
                            const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
                            console.log(`🔄 [API] Transformed entities:`, entities);
                            return entities;
                        } else {
                            console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
                            const entities = this.assembler.toEntitiesFromResponse(response as PatientsResponse);
                            console.log(`🔄 [API] Transformed entities:`, entities);
                            return entities;
                        }
                    })
                );
        }

    /**
     * Obtiene pacientes por doctorId
     */
    getByDoctorId(doctorId: number) {
        const url = `${this.endpointUrl}?doctorId=${doctorId}`;
        console.log(`🌐 [API] Requesting patients by doctorId from: ${url}`);
        return this.http.get<PatientsResponse | PatientResource[]>(url)
            .pipe(
                map(response => {
                    console.log(`📦 [API] Raw response from server:`, response);
                    // Manejar tanto arrays directos (JSON Server) como objetos con campo patients
                    if (Array.isArray(response)) {
                        console.log(`📦 [API] Response is an array, mapping directly`);
                        const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    } else {
                        console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
                        const entities = this.assembler.toEntitiesFromResponse(response as PatientsResponse);
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    }
                })
            );
    }
}