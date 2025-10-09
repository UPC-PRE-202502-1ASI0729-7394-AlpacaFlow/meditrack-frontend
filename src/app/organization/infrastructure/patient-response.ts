import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Representa el recurso/DTO del API para un paciente
 */
export interface PatientResource extends BaseResource {
    organizationId: number;
    doctorId?: number;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    weight: number;
    dni: string;
    height: number;
    imageUrl: string;
}

/**
 * Representa la estructura de respuesta del API para una Lista de pacientes
 */
export interface PatientsResponse extends BaseResponse {
    patients: PatientResource[];
}