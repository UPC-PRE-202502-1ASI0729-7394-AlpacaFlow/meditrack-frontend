import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Patient } from '../domain/model/patient.entity';
import { PatientResource, PatientsResponse } from './patient-response';

/**
 * Assembler para convertir entre entidades Patient, recursos PatientResource y respuestas PatientsResponse.
 */
export class PatientsAssembler implements BaseAssembler<Patient, PatientResource, PatientsResponse> {
    /**
     * Convierte un PatientsResponse en un arreglo de entidades Patient.
     * @param response - La respuesta de la API que contiene pacientes.
     * @returns Un arreglo de entidades Patient.
     */
    toEntitiesFromResponse(response: PatientsResponse): Patient[] {
        return response.patients.map((resource) =>
            this.toEntityFromResource(resource as PatientResource)
        );
    }

    /**
     * Convierte un PatientResource en una entidad Patient.
     * @param resource - El recurso a convertir.
     * @returns La entidad Patient convertida.
     */
    toEntityFromResource(resource: PatientResource): Patient {
        return new Patient({
            id: resource.id,
            firstName: resource.firstName,
            lastName: resource.lastName,
            age: resource.age,
            gender: resource.gender,
            weight: resource.weight,
            dni: resource.dni,
            height: resource.height,
            imageUrl: resource.imageUrl,
            organizationId: resource.organizationId,
            doctorId: resource.doctorId
        });
    }

    /**
     * Convierte una entidad Patient en un PatientResource.
     * @param entity - La entidad a convertir.
     * @returns El PatientResource convertido.
     */
    toResourceFromEntity(entity: Patient): PatientResource {
        return {
            id: entity.id,
            firstName: entity.firstName,
            lastName: entity.lastName,
            age: entity.age,
            gender: entity.gender,
            weight: entity.weight,
            dni: entity.dni,
            height: entity.height,
            imageUrl: entity.imageUrl,
            organizationId: entity.organizationId,
            doctorId: entity.doctorId
        } as PatientResource;
    }
}