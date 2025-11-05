import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for a caregiver
 * This interface matches the database schema (snake_case) for direct mapping from backend
 * BD: caregiver_id (PK), org_id (FK), user_id, first_name, last_name, phone_number, etc.
 */
export interface CaregiverResource extends BaseResource {
    // id is inherited from BaseResource (maps to caregiver_id in BD)
    org_id: number; // Maps to organizationId in entity (BD: org_id)
    user_id?: string; // Maps to userId in entity (BD: user_id, Optional: backend assigns when creating)
    first_name: string; // Maps to firstName in entity (BD: first_name)
    last_name: string; // Maps to lastName in entity (BD: last_name)
    phone_number: string; // Maps to phoneNumber in entity (BD: phone_number)
    // Optional fields that may be in DB or returned by API:
    age?: number;
    email?: string;
    specialty?: string; // May not be in BD specification
    image_url?: string; // Maps to imageUrl in entity (may not be in BD)
    assignedSeniorIds?: number[]; // Not in BD directly, comes from Caregiver_assignments table
}

/**
 * Represents the API response structure for a List of caregivers
 */
export interface CaregiversResponse extends BaseResponse {
    caregivers: CaregiverResource[];
}

