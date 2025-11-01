import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { Doctor } from '../domain/model/doctor.entity';
import { DoctorResource, DoctorsResponse } from './doctor-response';
import { DoctorsAssembler } from './doctor-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

/**
 * API endpoint for managing doctors.
 */
@Injectable({
  providedIn: 'root'
})
export class DoctorsApiEndpoint extends
    BaseApiEndpoint<Doctor, DoctorResource, DoctorsResponse, DoctorsAssembler> {
  constructor(http: HttpClient) {
    super(
        http,
        `${environment.platformProviderApiBaseUrl}${environment.platformProviderDoctorsEndpointPath}`,
        new DoctorsAssembler()
    );
  }

  /**
   * Obtiene doctores por organizationId
   */
  getByOrganizationId(organizationId: number) {
    const url = `${this.endpointUrl}?organizationId=${organizationId}`;
    console.log(`🌐 [API] Requesting doctors from: ${url}`);
    return this.http.get<DoctorsResponse | DoctorResource[]>(url)
      .pipe(
        map(response => {
          console.log(`📦 [API] Raw response from server:`, response);
          // Manejar tanto arrays directos (JSON Server) como objetos con campo doctors
          if (Array.isArray(response)) {
            console.log(`📦 [API] Response is an array, mapping directly`);
            const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
            console.log(`🔄 [API] Transformed entities:`, entities);
            return entities;
          } else {
            console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
            const entities = this.assembler.toEntitiesFromResponse(response as DoctorsResponse);
            console.log(`🔄 [API] Transformed entities:`, entities);
            return entities;
          }
        })
      );
  }
}