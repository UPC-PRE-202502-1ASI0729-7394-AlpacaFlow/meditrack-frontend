import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for a keeper
 */
export interface KeeperResource extends BaseResource {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    specialty: string;
    phoneNumber: string;
    imageUrl: string;
    organizationId: number;
}

/**
 * Represents the API response structure for a List of keepers
 */
export interface KeepersResponse extends BaseResponse {
    keepers: KeeperResource[];
}

