import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for a senior citizen
 * This interface matches the database schema (snake_case) for direct mapping from backend
 */
export interface SeniorCitizenResource extends BaseResource {
    org_id: number; // Maps to organizationId in entity (BD: org_id)
    first_name: string; // Maps to firstName in entity (BD: first_name)
    last_name: string; // Maps to lastName in entity (BD: last_name)
    birth_date: string; // ISO date string from API (BD: birth_date)
    age?: number; // Computed from birth_date (not in BD but might be returned)
    gender: string; // BD: gender
    weight: number; // BD: weight
    dni: string; // BD: dni
    height: number; // BD: height
    profile_image: string; // Maps to imageUrl in entity (BD: profile_image)
    device_id: string; // Maps to deviceIot in entity (BD: device_id, Unique)
    assignedDoctorId?: number | null; // Not in BD directly, comes from Doctor_assignments table (single doctor only)
    assignedCaregiverId?: number | null; // Not in BD directly, comes from Caregiver_assignments table (single caregiver only)
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

