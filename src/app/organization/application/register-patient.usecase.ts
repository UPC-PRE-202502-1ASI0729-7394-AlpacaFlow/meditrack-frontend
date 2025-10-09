import { lastValueFrom } from 'rxjs';
import {Patient} from "../domain/model/patient.entity";
import {PatientsApiEndpoint} from "../infrastructure/patient-api-endpoint";

export class RegisterPatientUseCase {
    constructor(private readonly patientsApi: PatientsApiEndpoint) {}

    /**
     * Registra un paciente en el sistema.
     * @param patient Paciente a registrar.
     * @returns Paciente registrado (devuelto por la API).
     */
    async execute(patient: Patient): Promise<Patient> {
        if (!patient || !patient.id || !patient.firstName || !patient.lastName) {
            throw new Error('El paciente debe tener un id, firstName y lastName válidos.');
        }

        try {
            // Registra al paciente en la API
            const createdPatient = await lastValueFrom(this.patientsApi.create(patient));
            return createdPatient;
        } catch (error) {
            console.error('Error al registrar el paciente en la API:', error);
            throw error;
        }
    }
}