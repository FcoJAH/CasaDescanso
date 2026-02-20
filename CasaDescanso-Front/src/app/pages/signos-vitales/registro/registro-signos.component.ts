import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordComplexityValidator, minAgeValidator } from '../../../utils/validators';
import { Router } from '@angular/router';
import { VitalSignsService } from '../signos-vitales.service';
import { ResidentesService } from '../../residentes/residentes.service';

@Component({
  selector: 'app-registro-signos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-signos.component.html',
  styleUrl: './registro-signos.component.css'
})
export class RegistroSignosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals para el manejo del popup (muy Angular 19)
  errorMessage = signal('');
  showPopup = signal(false);

  isRegistered = signal(false);
  registeredData = signal<{ username: string; message: string } | null>(null);
  usuarioLogueado = signal<any>(null);
  residentes = signal<any[]>([]);
  usuarios = signal<any[]>([]);

  signosForm: FormGroup = this.fb.group({
    residentId: ['', [Validators.required]],
    recordedByUserId: ['', [Validators.required]],
    temperature: [null, [Validators.required, Validators.min(30), Validators.max(45)]],
    bloodPressure: ['', [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
    heartRate: [null, [Validators.required, Validators.min(30), Validators.max(200)]],
    respiratoryFrequency: [null, [Validators.required, Validators.min(8), Validators.max(60)]],
    oxygenSaturation: [null, [Validators.required, Validators.min(50), Validators.max(100)]],
    glucoseLevel: [null, [Validators.required]],
    weight: [null, [Validators.required, Validators.min(20)]],
    notes: ['']
  });

  // En RegistrarEmpleadoComponent
  maxDate: string = '';
  authService: any;

  constructor() {
    const today = new Date();
    const year = today.getFullYear() - 15; // Año máximo permitido (2011)
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;
  }

  ngOnInit() {
    this.cargarCatalogos();
    this.establecerUsuarioResponsable();
  }

  establecerUsuarioResponsable() {
    // 1. Red de seguridad: Intentar obtener del servicio o directamente del Storage
    const user = this.authService?.currentUserSignal() || this.getBackupUser();

    if (user) {
      this.signosForm.patchValue({
        recordedByUserId: user.workerId
      });
      this.usuarioLogueado.set(user);
      console.log("✅ Usuario responsable asignado:", user.workerId, user.fullName);
    } else {
      console.error("❌ No se pudo recuperar el usuario de ninguna fuente.");
    }
  }

  // Método de respaldo por si el servicio falla en el arranque
  private getBackupUser(): any {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  private residentesService = inject(ResidentesService);

  cargarCatalogos() {
    this.residentesService.obtenerActivos().subscribe({
      next: (data) => {
        // Aquí se llena el catálogo que usa el @for del HTML
        this.residentes.set(data);
      },
      error: () => this.errorMessage.set('Error al conectar con la base de datos de residentes')
    });
  }

  // Inyectas el servicio
  private empleadosService = inject(VitalSignsService);

  onSubmit() {
    const payload = { ...this.signosForm.value };
    payload.residentId = parseInt(payload.residentId, 10);
    console.log('Formulario enviado con:', this.signosForm.value);
    console.log('Enviando a la API (Tipado corregido):', payload);

    this.empleadosService.registrarSignosVitales(payload).subscribe({
      next: () => {
        this.isRegistered.set(true);
        this.showPopup.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Error al guardar en el servidor');
        this.showPopup.set(true);
      }
    });
  }

  private mostrarError(msg: string) {
    this.errorMessage.set(msg);
    this.showPopup.set(true);
    setTimeout(() => this.showPopup.set(false), 3500);
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  // Helper para el HTML
  isFieldValid(field: string) {
    const control = this.signosForm.get(field);
    return control && control.valid && (control.dirty || control.touched);
  }

  isFieldInvalid(field: string) {
    const control = this.signosForm.get(field);
    return control && control.invalid && (control.dirty || control.touched);
  }

  isPasswordVisible = signal(false); // Estado para el ojo

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }
}