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
     * Obtiene senior citizens por organizationId
     */
    getByOrganizationId(organizationId: number) {
        const url = `${this.endpointUrl}?organizationId=${organizationId}`;
        console.log(`🌐 [API] Requesting senior citizens from: ${url}`);
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
     * Obtiene senior citizens por keeperId
     */
    getByKeeperId(keeperId: number) {
        const url = `${this.endpointUrl}?keeperId=${keeperId}`;
        console.log(`🌐 [API] Requesting senior citizens from: ${url}`);
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
