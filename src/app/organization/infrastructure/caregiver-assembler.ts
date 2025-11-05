import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Caregiver } from '../domain/model/caregiver.entity';
import { CaregiverResource, CaregiversResponse } from './caregiver-response';

/**
 * Assembler for converting between Caregiver entities, CaregiverResource resources, and CaregiversResponse.
 */
export class CaregiversAssembler implements
    BaseAssembler<Caregiver, CaregiverResource, CaregiversResponse> {

  /**
   * Converts a CaregiversResponse to an array of Caregiver entities.
   * @param response - The API response containing caregivers.
   * @returns An array of Caregiver entities.
   */
  toEntitiesFromResponse(response: CaregiversResponse): Caregiver[] {
    return response.caregivers.map(resource =>
        this.toEntityFromResource(resource as CaregiverResource));
  }

  /**
   * Converts a CaregiverResource (database schema - snake_case) to a Caregiver entity (domain - camelCase).
   * Maps database field names to domain entity property names.
   * @param resource - The resource to convert (from backend API, uses database field names).
   * @returns The converted Caregiver entity (domain model, uses camelCase).
   */
  toEntityFromResource(resource: CaregiverResource): Caregiver {
    return new Caregiver({
      id: resource.id, // BD: caregiver_id → Entity: id
      organizationId: resource.org_id, // BD: org_id → Entity: organizationId
      userId: resource.user_id, // BD: user_id → Entity: userId (Optional)
      firstName: resource.first_name, // BD: first_name → Entity: firstName
      lastName: resource.last_name, // BD: last_name → Entity: lastName
      phoneNumber: resource.phone_number, // BD: phone_number → Entity: phoneNumber
      age: resource.age, // Optional, may not be in BD
      email: resource.email, // Optional, may not be in BD
      specialty: resource.specialty ?? '', // Optional, may not be in BD
      imageUrl: resource.image_url ?? '', // Optional, may not be in BD
      assignedSeniorIds: resource.assignedSeniorIds ?? [] // From Caregiver_assignments table
    });
  }

  /**
   * Converts a Caregiver entity (domain - camelCase) to a CaregiverResource (database schema - snake_case).
   * Maps domain entity property names to database field names for the backend API.
   * @param entity - The entity to convert (domain model, uses camelCase).
   * @returns The converted CaregiverResource (for backend API, uses database field names).
   */
  toResourceFromEntity(entity: Caregiver): CaregiverResource {
    return {
      id: entity.id, // Entity: id → BD: caregiver_id
      org_id: entity.organizationId, // Entity: organizationId → BD: org_id
      user_id: entity.userId || undefined, // Entity: userId → BD: user_id (Optional)
      first_name: entity.firstName, // Entity: firstName → BD: first_name
      last_name: entity.lastName, // Entity: lastName → BD: last_name
      phone_number: entity.phoneNumber, // Entity: phoneNumber → BD: phone_number
      age: entity.age, // Optional
      email: entity.email, // Optional
      specialty: entity.specialty, // Optional
      image_url: entity.imageUrl, // Optional
      assignedSeniorIds: entity.assignedSeniorIds // For Caregiver_assignments table
    } as CaregiverResource;
  }
}

