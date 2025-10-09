import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for a doctor
 */
export interface DoctorResource extends BaseResource {
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
 * Represents the API response structure for a List of doctors
 */
export interface DoctorsResponse extends BaseResponse {
    doctors: DoctorResource[];
}
