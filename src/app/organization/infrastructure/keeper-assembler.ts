import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Keeper } from '../domain/model/keeper.entity';
import { KeeperResource, KeepersResponse } from './keeper-response';

/**
 * Assembler for converting between Keeper entities, KeeperResource resources, and KeepersResponse.
 */
export class KeepersAssembler implements
    BaseAssembler<Keeper, KeeperResource, KeepersResponse> {

  /**
   * Converts a KeepersResponse to an array of Keeper entities.
   * @param response - The API response containing keepers.
   * @returns An array of Keeper entities.
   */
  toEntitiesFromResponse(response: KeepersResponse): Keeper[] {
    return response.keepers.map(resource =>
        this.toEntityFromResource(resource as KeeperResource));
  }

  /**
   * Converts a KeeperResource to a Keeper entity.
   * @param resource - The resource to convert.
   * @returns The converted Keeper entity.
   */
  toEntityFromResource(resource: KeeperResource): Keeper {
    return new Keeper({
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      age: resource.age,
      email: resource.email,
      specialty: resource.specialty,
      phoneNumber: resource.phoneNumber,
      imageUrl: resource.imageUrl,
      organizationId: resource.organizationId
    });
  }

  /**
   * Converts a Keeper entity to a KeeperResource.
   * @param entity - The entity to convert.
   * @returns The converted KeeperResource.
   */
  toResourceFromEntity(entity: Keeper): KeeperResource {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      age: entity.age,
      email: entity.email,
      specialty: entity.specialty,
      phoneNumber: entity.phoneNumber,
      imageUrl: entity.imageUrl,
      organizationId: entity.organizationId
    } as KeeperResource;
  }
}

