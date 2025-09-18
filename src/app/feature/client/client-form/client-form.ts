import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Client } from '@interfaces/client';
import { ClientService } from '@services/client.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './client-form.html',
  styleUrls: ['./client-form.scss']
})
export class ClientForm implements OnInit {
  selectedClient: any;
  changeClientState(arg0: string) {
    throw new Error('Method not implemented.');
  }
  onActivate() {
    throw new Error('Method not implemented.');
  }

  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  @Input() client?: Client;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  documentTypes = ['DNI', 'CE'];
  todayDate = this.formatToBackendDate(new Date());

  maxBirthDate: string = '';

  ngOnInit(): void {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    this.maxBirthDate = maxDate.toISOString().split('T')[0];

    this.initForm();

    if (this.client) {
      this.form.patchValue({
        id: this.client.id,
        documentType: this.client.typeDocument,
        documentNumber: this.client.numberDocument,
        firstName: this.client.nameClient,
        lastName: this.client.lastname,
        birthDate: this.client.birthday,
        phoneNumber: this.client.cellphone,
        address: this.client.addressClient,
        email: this.client.email,
        visitFrequency: this.client.visitFrequency,
        registrationDate: this.client.registrationDate || this.maxBirthDate
      });
    }
  }
  private initForm(): void {
    this.form = this.fb.group({
      id: [''],
      documentType: ['DNI', Validators.required],
      documentNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{8}$/),
          Validators.minLength(8),
          Validators.maxLength(8)
        ]
      ],
      firstName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
          Validators.minLength(3) // Cantidad de Caracteres Permitidos 
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
          Validators.minLength(2) // Cantidad de Caracteres Permitidos 
        ]
      ],
      birthDate: ['', [Validators.required, this.validateBirthDate]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^9\d{8}$/),
          Validators.minLength(9),
          Validators.maxLength(9)
        ]
      ],
      address: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@]+@[^@]+\.[^@]+$/)]],
      registrationDate: [{
        value: this.todayDate,
        disabled: true
      }]
    });
  }

  private formatToBackendDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  validateBirthDate = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();

    // Calcula la  fecha mínima válida (hace 18 años)
    const minValidDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    if (birthDate > minValidDate) {
      return { underage: true }; // Menor de 18 años
    }

    return null; // Mayor o igual a 18
  };


  onDocumentTypeChange(): void {
    const docType = this.form.get('documentType')?.value;
    const docNumberControl = this.form.get('documentNumber');

    if (!docNumberControl) return;

    if (docType === 'DNI') {
      docNumberControl.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]);
    } else {
      docNumberControl.setValidators([
        Validators.required,
        Validators.pattern(/^\d{12,20}$/),
        Validators.minLength(12),
        Validators.maxLength(20)
      ]);
    }
    docNumberControl.reset();
    docNumberControl.updateValueAndValidity();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    Swal.fire({
      title: '¿Registrar nuevo cliente?',
      icon: 'question',
      iconColor: '#80A7A3',
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#80A7A3',
      cancelButtonColor: '#FED4C6'
    }).then((result) => {
      if (result.isConfirmed) {
        const clientData = this.prepareClientData();
        console.log('Datos a enviar al backend:', clientData);
        this.clientService.save(clientData).subscribe({
          next: () => this.handleSuccess('¡Registrado!', 'Cliente creado con éxito'),
          error: (err) => this.handleError(err)
        });
      }
    });
  }

  onUpdate(): void {
    if (this.form.invalid || !this.client?.id) {
      this.markAllAsTouched();
      return;
    }

    const id = this.client.id;
  }


  private prepareClientData(): Client {
    const formData = this.form.getRawValue();
    return {
      id: formData.id,
      typeDocument: formData.documentType,
      numberDocument: formData.documentNumber,
      nameClient: formData.firstName,
      lastname: formData.lastName,
      birthday: formData.birthDate,
      cellphone: formData.phoneNumber,
      email: formData.email,
      registrationDate: formData.registrationDate || this.todayDate,
      addressClient: formData.address,
      visitFrequency: formData.visit_frequency,
      state: this.client?.state || 'A'
    };
  }

  private handleSuccess(title: string, text: string): void {
    Swal.fire(title, text, 'success');
    this.saved.emit();
    if (!this.client) {
      this.form.reset();
      this.initForm();
    }
  }

  private handleError(err: unknown): void {
    console.error('Error:', err);
    let errorMessage = 'No se pudo completar la operación';

    if (typeof err === 'object' && err !== null) {
      const errorObj = err as Record<string, any>;

      if ('error' in errorObj && typeof errorObj['error'] === 'object' && errorObj['error'] !== null) {
        const serverError = errorObj['error'] as Record<string, any>;

        if ('message' in serverError) {
          errorMessage = String(serverError['message']);
        } else if ('errors' in serverError && typeof serverError['errors'] === 'object' && serverError['errors'] !== null) {
          errorMessage = Object.values(serverError['errors']).join('\n');
        }
      } else if ('message' in errorObj) {
        errorMessage = String(errorObj['message']);
      }
    }

    Swal.fire('Error', errorMessage, 'error');
  }

  private markAllAsTouched(): void {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
    Swal.fire('Error', 'Por favor complete todos los campos requeridos correctamente', 'error');
  }

  onlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) return;

    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onlyLetters(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (allowedKeys.includes(event.key)) return;

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
