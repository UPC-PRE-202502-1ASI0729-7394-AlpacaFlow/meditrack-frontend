import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { Doctor } from '../domain/model/doctor.entity';
import { DoctorResource, DoctorsResponse } from './doctor-response';
import { DoctorsAssembler } from './doctor-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    return this.http.get<DoctorsResponse>(`${this.endpointUrl}?organizationId=${organizationId}`)
      .pipe(
        // @ts-ignore
        map(response => this.assembler.toEntitiesFromResponse(response))
      );
  }
}
