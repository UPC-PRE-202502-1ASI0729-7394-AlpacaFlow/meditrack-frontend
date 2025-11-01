import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for a senior citizen
 */
export interface SeniorCitizenResource extends BaseResource {
    organizationId: number;
    keeperId?: number;
    fullName: string;
    age: number;
    gender: string;
    weight: number;
    dni: string;
    height: number;
    imageUrl: string;
    deviceIot: string;
    signalVitals?: {
        bloodPressure?: number[][];
        heartRate?: number[];
        temperature?: number[];
        oxygenLevel?: { ox: number }[];
    };
    alerts?: Array<{
        id: number | null;
        alertTitle: string;
        date: string;
        time: string;
        dataRegistered: string;
        reason: string;
    }>;
}

/**
 * Represents the API response structure for a List of senior citizens
 */
export interface SeniorCitizensResponse extends BaseResponse {
    seniorCitizens: SeniorCitizenResource[];
}

