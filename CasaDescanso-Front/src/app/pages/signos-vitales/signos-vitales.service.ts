import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VitalSigns {
    id?: number;
    residenteId: number;
    temperature: number;      // Ej. 36.5
    bloodPressure: string;    // Ej. "120/80"
    heartRate: number;        // Latidos por minuto
    oxygenSaturation: number; // Porcentaje (SpO2)
    respiratoryRate: number;  // Respiraciones por minuto
    registrationDate?: string; // ISO String
    observations?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VitalSignsService {
    private http = inject(HttpClient);
    private apiUrl = 'http://10.161.203.97:5195/api';

    registrarSignosVitales(signos: VitalSigns) {
        return this.http.post(`${this.apiUrl}/VitalSigns`, signos);
    }

    obtenerSignosVitalesPorResidente(residenteId: number) {
        return this.http.get<VitalSigns[]>(`${this.apiUrl}/VitalSigns/resident/${residenteId}`);
    }

    obtenerResidentes() {
        return this.http.get<{ id: number; name: string }[]>(`${this.apiUrl}/Residents/all`);
    }

    obtenerUsuarios() {
        return this.http.get<{ id: number; username: string }[]>(`${this.apiUrl}/Workers/all`);
    }

    getWorkerDetail(id: number) {
    return this.http.get<any>(`${this.apiUrl}/Workers/detail/${id}`);
    }
}