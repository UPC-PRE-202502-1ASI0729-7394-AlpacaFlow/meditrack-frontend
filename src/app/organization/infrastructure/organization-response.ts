import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for an organization
 * This interface matches the database schema (snake_case) for direct mapping from backend
 * BD: org_id (PK), name, type
 */
export interface OrganizationResource extends BaseResource {
    // id is inherited from BaseResource (maps to org_id in BD)
    name: string; // BD: name
    type: 'clinica' | 'resident'; // BD: type
}

/**
 * Represents the API response structure for a List of organizations
 */
export interface OrganizationsResponse extends BaseResponse {
    organizations: OrganizationResource[];
}

