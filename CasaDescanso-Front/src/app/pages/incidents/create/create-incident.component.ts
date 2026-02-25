import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incidente, IncidentsService } from '../incidents.service';

@Component({
    selector: 'app-crear-incidente',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './create-incident.component.html',
    styleUrls: ['./create-incident.component.css']
})
export class CrearIncidenciaComponent implements OnInit {
    private incidentesService = inject(IncidentsService);
    private router = inject(Router);

    // Signals para el estado del formulario y datos
    residentes = signal<any[]>([]);
    residenteSeleccionado = signal<any>(null);
    tipoIncidente = signal<string>('');
    severidad = signal<string>('');
    descripcion = signal<string>('');

    // Signals de control
    loading = signal(false);
    isError = signal(false);
    isSuccess = signal(false);
    errorMessage = signal('');

    ngOnInit() {
        this.cargarResidentes();
    }

    cargarResidentes() {
        this.incidentesService.getResindets().subscribe({
            next: (data) => this.residentes.set(data),
            error: () => {
                this.isError.set(true);
                this.errorMessage.set('Error al cargar la lista de residentes.');
            }
        });
    }

    onSeleccionar(event: any) {
        const id = Number(event.target.value);
        const seleccionado = this.residentes().find(u => u.id === id);
        this.residenteSeleccionado.set(seleccionado || null);
    }

    onSubmit() {
        const empleadoId = this.residenteSeleccionado().id;
        if (empleadoId === 0 || !this.tipoIncidente() || !this.severidad() || !this.descripcion()) {
            this.mostrarError('TODOS LOS CAMPOS SON OBLIGATORIOS.');
            return;
        }

        this.loading.set(true);
        this.isError.set(false);

        // Construcción del objeto Incidente
        const payload: Incidente = {
            residentId: empleadoId,
            registeredByUserId: 1, // ID del usuario logueado (ej. Francisco)
            date: new Date().toISOString(),
            type: this.tipoIncidente(),
            severityLevel: this.severidad(),
            description: this.descripcion()
        };

        console.log('Payload a enviar:', payload);

        this.incidentesService.crearIncident( payload ).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res?.isBusinessError) {
                    this.mostrarError(res.errorMessage);
                } else {
                    this.isSuccess.set(true);
                    this.resetForm();
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.mostrarError('ERROR TÉCNICO AL REGISTRAR EL INCIDENTE.');
                console.error(err);
            }
        });
    }

    resetVista() {
        // 1. Limpiamos estados de error y éxito
        this.isError.set(false);
        this.isSuccess.set(false);
        this.errorMessage.set('');

        this.tipoIncidente.set('');
        this.severidad.set('');
        this.descripcion.set('');

        // 3. Si tienes una señal para el objeto completo del residente, también límpiala
        // this.empleadoSeleccionado.set(null);
    }

    private mostrarError(msg: string) {
        this.isError.set(true);
        this.errorMessage.set(msg.toUpperCase());
        setTimeout(() => this.isError.set(false), 5000);
    }

    resetForm() {
        this.residenteSeleccionado.set(null);
        this.tipoIncidente.set('');
        this.severidad.set('');
        this.descripcion.set('');
    }

    volver() {
        this.router.navigate(['/incidentes']);
    }
}