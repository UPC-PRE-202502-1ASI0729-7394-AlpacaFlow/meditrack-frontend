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
   * Converts a DoctorResource to a Doctor entity.
   * @param resource - The resource to convert.
   * @returns The converted Doctor entity.
   */
  toEntityFromResource(resource: DoctorResource): Doctor {
    return new Doctor({
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
   * Converts a Doctor entity to a DoctorResource.
   * @param entity - The entity to convert.
   * @returns The converted DoctorResource.
   */
  toResourceFromEntity(entity: Doctor): DoctorResource {
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
    } as DoctorResource;
  }
}
