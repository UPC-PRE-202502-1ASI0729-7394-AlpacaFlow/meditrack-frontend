import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { Caregiver } from '../domain/model/caregiver.entity';
import { CaregiverResource, CaregiversResponse } from './caregiver-response';
import { CaregiversAssembler } from './caregiver-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

/**
 * API endpoint for managing caregivers.
 */
export class CaregiversApiEndpoint extends
    BaseApiEndpoint<Caregiver, CaregiverResource, CaregiversResponse, CaregiversAssembler> {

  constructor(
    http: HttpClient,
  ) {
    super(
        http,
        `${environment.platformProviderApiBaseUrl}${environment.platformProviderCaregiversEndpointPath}`,
        new CaregiversAssembler()
    );
  }

  /**
   * Obtiene caregivers por organizationId (org_id en BD)
   * Usa org_id como parámetro de consulta para coincidir con el esquema de BD
   */
  getByOrganizationId(organizationId: number) {
    const url = `${this.endpointUrl}?org_id=${organizationId}`;
    console.log(`🌐 [API] Requesting caregivers from: ${url} (org_id=${organizationId})`);
    return this.http.get<CaregiversResponse | CaregiverResource[]>(url)
      .pipe(
        map(response => {
          console.log(`📦 [API] Raw response from server:`, response);
          // Manejar tanto arrays directos (JSON Server) como objetos con campo caregivers
          if (Array.isArray(response)) {
            console.log(`📦 [API] Response is an array, mapping directly`);
            const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
            console.log(`🔄 [API] Transformed entities:`, entities);
            return entities;
          } else {
            console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
            const entities = this.assembler.toEntitiesFromResponse(response as CaregiversResponse);
            console.log(`🔄 [API] Transformed entities:`, entities);
            return entities;
          }
        })
      );
  }
}

