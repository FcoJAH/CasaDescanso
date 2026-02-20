import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz según tu JSON para tener tipado estricto
export interface DashboardData {
  totalResidents: number;
  activeResidents: number;
  inactiveResidents: number;
  totalWorkers: number;
  activeWorkers: number;
  inactiveWorkers: number;
  openIncidents: number;
  resolvedIncidents: number;
  workersWorkingNow: number;
  checkInsToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `http://10.161.203.97:5195/api/Dashboard`;

  getStats(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}