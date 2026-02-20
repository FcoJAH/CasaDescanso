import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentesService } from '../residentes.service';

@Component({
  selector: 'app-registro-residente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-residente.component.html',
  styleUrl: './registro-residente.component.css'
})
export class RegistrarResidenteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private residentesService = inject(ResidentesService);

  // Signals para feedback y estado
  errorMessage = signal('');
  showPopup = signal(false);
  isRegistered = signal(false);
  
  // Data de éxito (Ajustada a residentes)
  registeredData = signal<{ fullName: string; message: string } | null>(null);

  residenteForm: FormGroup = this.fb.group({
    // Información Personal
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    middleName: ['', [Validators.required]],
    birthDate: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    admissionDate: [new Date().toISOString().split('T')[0], [Validators.required]], // Por defecto hoy
    
    // Datos Médicos
    nss: [null, [Validators.pattern(/^\d{11}$/)]],
    bloodType: ['', [Validators.required]],
    diagnosedDiseases: [''],
    allergies: [''],
    photoPath: [''], // Se puede expandir luego para carga de archivos
    
    // Contacto Principal
    emergencyContactName: ['', [Validators.required]],
    emergencyContactPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    emergencyContactRelation: ['', [Validators.required]],
    
    // Contacto Secundario
    secondContactName: [''],
    secondContactPhone: ['', [Validators.pattern('^[0-9]{10}$')]],
    
    // Otros
    observations: ['']
  });

  maxDate: string = '';

  constructor() {
    // Para residentes, permitimos cualquier fecha pasada, pero no futura
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Aquí podrías cargar catálogos médicos si fuera necesario
  }

  onSubmit() {
    if (this.residenteForm.valid) {
      // Formateamos los nombres a MAYÚSCULAS antes de enviar (según tu instrucción)
      const formValue = { ...this.residenteForm.value };
      formValue.firstName = formValue.firstName;
      formValue.lastName = formValue.lastName;
      formValue.middleName = formValue.middleName;

      this.residentesService.registrarResidente(formValue).subscribe({
        next: (res) => {
          this.registeredData.set({
            fullName: `${formValue.firstName} ${formValue.lastName}`,
            message: 'Residente registrado exitosamente'
          });
          this.isRegistered.set(true);
          this.residenteForm.reset();
        },
        error: (err) => {
          this.errorMessage.set('Error al conectar con el servidor de Casa Descanso');
          this.showPopup.set(true);
          setTimeout(() => this.showPopup.set(false), 3500);
        }
      });
    } else {
      this.validarCamposYMostrarError();
    }
  }

  volver() {
    this.router.navigate(['/residentes']);
  }

  private validarCamposYMostrarError() {
    const controls = this.residenteForm.controls;

    if (this.residenteForm.invalid) {
      if (controls['emergencyContactPhone'].invalid && controls['emergencyContactPhone'].value) {
        this.errorMessage.set('El teléfono debe tener 10 dígitos');
      } 
      else if (controls['nss'].invalid && controls['nss'].value) {
        this.errorMessage.set('El NSS debe ser de 11 dígitos');
      }
      else {
        this.errorMessage.set('Falta rellenar algún campo obligatorio (*)');
      }

      this.showPopup.set(true);
      this.residenteForm.markAllAsTouched();
      setTimeout(() => this.showPopup.set(false), 3500);
    }
  }

  // Helpers para validación visual en el HTML
  isFieldValid(field: string) {
    const control = this.residenteForm.get(field);
    return control && control.valid && (control.dirty || control.touched);
  }

  isFieldInvalid(field: string) {
    const control = this.residenteForm.get(field);
    return control && control.invalid && (control.dirty || control.touched);
  }
}