import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-enpoint';
import { Keeper } from '../domain/model/keeper.entity';
import { KeeperResource, KeepersResponse } from './keeper-response';
import { KeepersAssembler } from './keeper-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

/**
 * API endpoint for managing keepers.
 */
export class KeepersApiEndpoint extends
    BaseApiEndpoint<Keeper, KeeperResource, KeepersResponse, KeepersAssembler> {

  constructor(
    http: HttpClient,
  ) {
    super(
        http,
        `${environment.platformProviderApiBaseUrl}${environment.platformProviderKeepersEndpointPath}`,
        new KeepersAssembler()
    );
  }

  /**
   * Obtiene keepers por organizationId
   */
  getByOrganizationId(organizationId: number) {
    const url = `${this.endpointUrl}?organizationId=${organizationId}`;
    console.log(`🌐 [API] Requesting keepers from: ${url}`);
    return this.http.get<KeepersResponse | KeeperResource[]>(url)
      .pipe(
        map(response => {
          console.log(`📦 [API] Raw response from server:`, response);
          // Manejar tanto arrays directos (JSON Server) como objetos con campo keepers
          if (Array.isArray(response)) {
            console.log(`📦 [API] Response is an array, mapping directly`);
            const entities = response.map(resource => this.assembler.toEntityFromResource(resource));
            console.log(`🔄 [API] Transformed entities:`, entities);
            return entities;
          } else {
            console.log(`📦 [API] Response is an object, using toEntitiesFromResponse`);
            const entities = this.assembler.toEntitiesFromResponse(response as KeepersResponse);
            console.log(`🔄 [API] Transformed entities:`, entities);
            return entities;
          }
        })
      );
  }
}
