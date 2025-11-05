import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { SeniorCitizen } from '../domain/model/senior-citizen.entity';
import { SeniorCitizenResource, SeniorCitizensResponse } from './senior-citizen-response';

/**
 * Assembler for converting between SeniorCitizen entities, SeniorCitizenResource resources, and SeniorCitizensResponse.
 */
export class SeniorCitizensAssembler implements BaseAssembler<SeniorCitizen, SeniorCitizenResource, SeniorCitizensResponse> {
    /**
     * Converts a SeniorCitizensResponse to an array of SeniorCitizen entities.
     * @param response - The API response containing senior citizens.
     * @returns An array of SeniorCitizen entities.
     */
    toEntitiesFromResponse(response: SeniorCitizensResponse): SeniorCitizen[] {
        return response.seniorCitizens.map((resource) =>
            this.toEntityFromResource(resource as SeniorCitizenResource)
        );
    }

    /**
     * Converts a SeniorCitizenResource (database schema - snake_case) to a SeniorCitizen entity (domain - camelCase).
     * Maps database field names to domain entity property names.
     * @param resource - The resource to convert (from backend API, uses database field names).
     * @returns The converted SeniorCitizen entity (domain model, uses camelCase).
     */
    toEntityFromResource(resource: SeniorCitizenResource): SeniorCitizen {
        return new SeniorCitizen({
            id: resource.id,
            organizationId: resource.org_id, // BD: org_id → Entity: organizationId
            firstName: resource.first_name, // BD: first_name → Entity: firstName
            lastName: resource.last_name, // BD: last_name → Entity: lastName
            birthDate: resource.birth_date, // BD: birth_date → Entity: birthDate (will be converted to Date in constructor)
            age: resource.age, // Optional, computed from birth_date
            gender: resource.gender, // BD: gender → Entity: gender
            weight: resource.weight, // BD: weight → Entity: weight
            dni: resource.dni, // BD: dni → Entity: dni
            height: resource.height, // BD: height → Entity: height
            imageUrl: resource.profile_image, // BD: profile_image → Entity: imageUrl
            deviceIot: resource.device_id, // BD: device_id → Entity: deviceIot
            assignedDoctorId: resource.assignedDoctorId ?? null, // From Doctor_assignments table (single doctor only)
            assignedCaregiverId: resource.assignedCaregiverId ?? null, // From Caregiver_assignments table (single caregiver only)
            signalVitals: resource.signalVitals,
            alerts: resource.alerts
        });
    }

    /**
     * Converts a SeniorCitizen entity (domain - camelCase) to a SeniorCitizenResource (database schema - snake_case).
     * Maps domain entity property names to database field names for the backend API.
     * @param entity - The entity to convert (domain model, uses camelCase).
     * @returns The converted SeniorCitizenResource (for backend API, uses database field names).
     */
    toResourceFromEntity(entity: SeniorCitizen): SeniorCitizenResource {
        return {
            id: entity.id,
            org_id: entity.organizationId, // Entity: organizationId → BD: org_id
            first_name: entity.firstName, // Entity: firstName → BD: first_name
            last_name: entity.lastName, // Entity: lastName → BD: last_name
            birth_date: entity.birthDate.toISOString().split('T')[0], // Entity: birthDate → BD: birth_date (Convert Date to ISO string YYYY-MM-DD)
            age: entity.age, // Optional, computed from birth_date
            gender: entity.gender, // Entity: gender → BD: gender
            weight: entity.weight, // Entity: weight → BD: weight
            dni: entity.dni, // Entity: dni → BD: dni
            height: entity.height, // Entity: height → BD: height
            profile_image: entity.imageUrl, // Entity: imageUrl → BD: profile_image
            device_id: entity.deviceIot, // Entity: deviceIot → BD: device_id
            assignedDoctorId: entity.assignedDoctorId ?? null, // For Doctor_assignments table (single doctor only)
            assignedCaregiverId: entity.assignedCaregiverId ?? null, // For Caregiver_assignments table (single caregiver only)
            signalVitals: entity.signalVitals ? {
                bloodPressure: entity.signalVitals.bloodPressure,
                heartRate: entity.signalVitals.heartRate,
                temperature: entity.signalVitals.temperature,
                oxygenLevel: entity.signalVitals.oxygenLevel
            } : undefined,
            alerts: entity.alerts ? entity.alerts.map(alert => ({
                id: alert.id,
                alertTitle: alert.alertTitle,
                date: alert.date,
                time: alert.time,
                dataRegistered: alert.dataRegistered,
                reason: alert.reason
            })) : undefined
        } as SeniorCitizenResource;
    }
}

