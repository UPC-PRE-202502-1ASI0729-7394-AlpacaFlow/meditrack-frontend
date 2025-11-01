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
 * Representa la estructura de respuesta del API para una Lista de pacientes
 */
export interface PatientsResponse extends BaseResponse {
    patients: PatientResource[];
}