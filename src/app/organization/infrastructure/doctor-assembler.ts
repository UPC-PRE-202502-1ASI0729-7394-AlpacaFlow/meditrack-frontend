import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Doctor } from '../domain/model/doctor.entity';
import { DoctorResource, DoctorsResponse } from './doctor-response';

/**
 * Assembler for converting between Doctor entities, DoctorResource resources, and DoctorsResponse.
 */
export class DoctorsAssembler implements
    BaseAssembler<Doctor, DoctorResource, DoctorsResponse> {

  /**
   * Converts a DoctorsResponse to an array of Doctor entities.
   * @param response - The API response containing doctors.
   * @returns An array of Doctor entities.
   */
  toEntitiesFromResponse(response: DoctorsResponse): Doctor[] {
    return response.doctors.map(resource =>
        this.toEntityFromResource(resource as DoctorResource));
  }

  /**
   * Converts a DoctorResource (database schema - snake_case) to a Doctor entity (domain - camelCase).
   * Maps database field names to domain entity property names.
   * @param resource - The resource to convert (from backend API, uses database field names).
   * @returns The converted Doctor entity (domain model, uses camelCase).
   */
  toEntityFromResource(resource: DoctorResource): Doctor {
    return new Doctor({
      id: resource.id, // BD: doctor_id → Entity: id
      organizationId: resource.org_id, // BD: org_id → Entity: organizationId
      userId: resource.user_id, // BD: user_id → Entity: userId (Optional)
      firstName: resource.first_name, // BD: first_name → Entity: firstName
      lastName: resource.last_name, // BD: last_name → Entity: lastName
      age: resource.age, // Optional, may not be in BD
      email: resource.email, // Optional, may not be in BD
      specialty: resource.specialty, // BD: specialty → Entity: specialty
      phoneNumber: resource.phone_number ?? '', // BD: phone_number → Entity: phoneNumber
      imageUrl: resource.image_url ?? '', // Optional, may not be in BD
      assignedSeniorIds: resource.assignedSeniorIds ?? [] // From Doctor_assignments table
    });
  }

  /**
   * Converts a Doctor entity (domain - camelCase) to a DoctorResource (database schema - snake_case).
   * Maps domain entity property names to database field names for the backend API.
   * @param entity - The entity to convert (domain model, uses camelCase).
   * @returns The converted DoctorResource (for backend API, uses database field names).
   */
  toResourceFromEntity(entity: Doctor): DoctorResource {
    return {
      id: entity.id, // Entity: id → BD: doctor_id
      org_id: entity.organizationId, // Entity: organizationId → BD: org_id
      user_id: entity.userId || undefined, // Entity: userId → BD: user_id (Optional)
      first_name: entity.firstName, // Entity: firstName → BD: first_name
      last_name: entity.lastName, // Entity: lastName → BD: last_name
      specialty: entity.specialty, // Entity: specialty → BD: specialty
      phone_number: entity.phoneNumber, // Entity: phoneNumber → BD: phone_number
      age: entity.age, // Optional
      email: entity.email, // Optional
      image_url: entity.imageUrl, // Optional
      assignedSeniorIds: entity.assignedSeniorIds // For Doctor_assignments table
    } as DoctorResource;
  }
}
