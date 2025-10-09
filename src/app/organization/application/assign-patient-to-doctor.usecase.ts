import { Injectable } from '@angular/core';

export interface AssignPatientToDoctorCommand {
    doctorId: string;
    patientId: string;
}

@Injectable({
    providedIn: 'root',
})
export class AssignPatientToDoctorUseCase {
    private assignments: Record<string, string[]> = {};

    execute(command: AssignPatientToDoctorCommand): void {
        const { doctorId, patientId } = command;

        // Agregar al paciente en la lista del doctor asignado
        if (!this.assignments[doctorId]) {
            this.assignments[doctorId] = [];
        }
        if (!this.assignments[doctorId].includes(patientId)) {
            this.assignments[doctorId].push(patientId);
        }
    }

    // (Adicional) Obtener pacientes asignados a un doctor
    getPatientsByDoctorId(doctorId: string): string[] {
        return this.assignments[doctorId] || [];
    }
}