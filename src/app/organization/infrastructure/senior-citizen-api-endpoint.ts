import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { SeniorCitizen } from '../domain/model/senior-citizen.entity';
import { SeniorCitizenResource, SeniorCitizensResponse } from './senior-citizen-response';
import { SeniorCitizensAssembler } from './senior-citizen-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

/**
 * API endpoint for managing senior citizens.
 */
export class SeniorCitizensApiEndpoint extends BaseApiEndpoint<
    SeniorCitizen,
    SeniorCitizenResource,
    SeniorCitizensResponse,
    SeniorCitizensAssembler
> {

    constructor(
        http: HttpClient,
    ) {
        super(
            http,
            `${environment.platformProviderApiBaseUrl}${environment.platformProviderSeniorCitizensEndpointPath}`,
            new SeniorCitizensAssembler()
        );
    }

    /**
     * Obtiene senior citizens por organizationId (org_id en BD)
     * Usa org_id como parámetro de consulta para coincidir con el esquema de BD
     */
    getByOrganizationId(organizationId: number) {
        const url = `${this.endpointUrl}?org_id=${organizationId}`;
        console.log(`🌐 [API] Requesting senior citizens from: ${url} (org_id=${organizationId})`);
        return this.http.get<SeniorCitizensResponse | SeniorCitizenResource[]>(url)
            .pipe(
                map(response => {
                    console.log(`📦 [API] Raw response from server:`, response);
                    // Manejar tanto arrays directos (JSON Server) como objetos con campo seniorCitizens
                    if (Array.isArray(response)) {
                        console.log(`📦 [API] Response is an array, mapping directly`);
                        const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    } else {
                        console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
                        const entities = this.assembler.toEntitiesFromResponse(response as SeniorCitizensResponse);
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    }
                })
            );
    }

    /**
     * Obtiene senior citizens por doctorId (doctor_id en BD)
     * Usa doctor_id como parámetro de consulta para coincidir con el esquema de BD
     */
    getByDoctorId(doctorId: number) {
        const url = `${this.endpointUrl}?doctor_id=${doctorId}`;
        console.log(`🌐 [API] Requesting senior citizens from: ${url} (doctor_id=${doctorId})`);
        return this.http.get<SeniorCitizensResponse | SeniorCitizenResource[]>(url)
            .pipe(
                map(response => {
                    console.log(`📦 [API] Raw response from server:`, response);
                    // Manejar tanto arrays directos (JSON Server) como objetos con campo seniorCitizens
                    if (Array.isArray(response)) {
                        console.log(`📦 [API] Response is an array, mapping directly`);
                        const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    } else {
                        console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
                        const entities = this.assembler.toEntitiesFromResponse(response as SeniorCitizensResponse);
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    }
                })
            );
    }

    /**
     * Obtiene senior citizens por caregiverId (caregiver_id en BD)
     * Usa caregiver_id como parámetro de consulta para coincidir con el esquema de BD
     */
    getByCaregiverId(caregiverId: number) {
        const url = `${this.endpointUrl}?caregiver_id=${caregiverId}`;
        console.log(`🌐 [API] Requesting senior citizens from: ${url} (caregiver_id=${caregiverId})`);
        return this.http.get<SeniorCitizensResponse | SeniorCitizenResource[]>(url)
            .pipe(
                map(response => {
                    console.log(`📦 [API] Raw response from server:`, response);
                    // Manejar tanto arrays directos (JSON Server) como objetos con campo seniorCitizens
                    if (Array.isArray(response)) {
                        console.log(`📦 [API] Response is an array, mapping directly`);
                        const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    } else {
                        console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
                        const entities = this.assembler.toEntitiesFromResponse(response as SeniorCitizensResponse);
                        console.log(`🔄 [API] Transformed entities:`, entities);
                        return entities;
                    }
                })
            );
    }
}
