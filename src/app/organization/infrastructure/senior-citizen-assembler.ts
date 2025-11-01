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
     * Converts a SeniorCitizenResource to a SeniorCitizen entity.
     * @param resource - The resource to convert.
     * @returns The converted SeniorCitizen entity.
     */
    toEntityFromResource(resource: SeniorCitizenResource): SeniorCitizen {
        return new SeniorCitizen({
            id: resource.id,
            fullName: resource.fullName,
            age: resource.age,
            gender: resource.gender,
            weight: resource.weight,
            dni: resource.dni,
            height: resource.height,
            imageUrl: resource.imageUrl,
            organizationId: resource.organizationId,
            keeperId: resource.keeperId,
            deviceIot: resource.deviceIot,
            signalVitals: resource.signalVitals,
            alerts: resource.alerts
        });
    }

    /**
     * Converts a SeniorCitizen entity to a SeniorCitizenResource.
     * @param entity - The entity to convert.
     * @returns The converted SeniorCitizenResource.
     */
    toResourceFromEntity(entity: SeniorCitizen): SeniorCitizenResource {
        return {
            id: entity.id,
            fullName: entity.fullName,
            age: entity.age,
            gender: entity.gender,
            weight: entity.weight,
            dni: entity.dni,
            height: entity.height,
            imageUrl: entity.imageUrl,
            organizationId: entity.organizationId,
            keeperId: entity.keeperId,
            deviceIot: entity.deviceIot,
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

