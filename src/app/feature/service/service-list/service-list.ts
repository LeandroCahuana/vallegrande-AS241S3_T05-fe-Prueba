import { Component, Input, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/interfaces/service'; // Usamos la interfaz compartida
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './service-list.html',
  styleUrls: ['./service-list.scss']
})
export class ServiceList implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  paginatedServices: Service[] = [];

  // Filtros
  ctgTypeFilter: string = '';
  statusFilter: string = '';

  // Ordenar
  sortOption: string = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 6;

  // Modal
  showModal: boolean = false;
  showModalEdit: boolean = false;
  showModalDelete: boolean = false;
  selectedService: Service | null = null;

  // ModalEdit
  formEdit!: FormGroup;
  Category = ['CC', 'CM', 'CP', 'CR', 'DC', 'DR', 'DM', 'DP', 'DD'];
  todayDate = this.formatToBackendDate(new Date());

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private serviceService = inject(ServiceService);

  @Input() service?: Service;
  @Output() saved = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadServices();
    this.initForm();
  }

  loadServices(): void {
    this.serviceService.findAll().subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.filteredServices = [...this.services];
        this.updatePaginatedServices();
      },
      error: (err: any) => {
        console.error('Error al cargar servicios:', err);
        Swal.fire('Error', 'No se pudieron cargar los servicios', 'error');
      }
    });
  }

  applyFilters(): void {
    this.filteredServices = this.services.filter(service => {
      const matchesDocType = !this.ctgTypeFilter || service.category === this.ctgTypeFilter;
      const statusFilterBool = this.statusFilter === 'true' ? true : this.statusFilter === 'false' ? false : null;
      const matchesStatus = statusFilterBool === null || service.state === statusFilterBool;
      return matchesDocType && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePaginatedServices();
    this.sortServices();
  }

  resetFilters(): void {
    this.ctgTypeFilter = '';
    this.statusFilter = '';
    this.sortOption = '';
    this.filteredServices = [...this.services];
    this.currentPage = 1;
    this.updatePaginatedServices();
    this.loadServices();
  }

  sortServices(): void {
    switch (this.sortOption) {
      case 'name_asc':
        this.filteredServices.sort((a, b) =>
          a.name_service.localeCompare(b.name_service));
        break;
      case 'name_desc':
        this.filteredServices.sort((a, b) =>
          b.name_service.localeCompare(a.name_service));
        break;
      case 'price_asc':
        this.filteredServices.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        this.filteredServices.sort((a, b) => b.price - a.price);
        break;
      case 'date_asc':
        this.filteredServices.sort((a, b) =>
          new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime());
        break;
      case 'date_desc':
        this.filteredServices.sort((a, b) =>
          new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime());
        break;
      default:
        return;
    }

    this.currentPage = 1;
    this.updatePaginatedServices();
  }

  updatePaginatedServices(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedServices = this.filteredServices.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedServices();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedServices();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredServices.length / this.itemsPerPage);
  }

  // Métodos para el modal
  openModal(service: Service): void {
    this.selectedService = service;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal') || target.classList.contains('close-btn')) {
      this.showModal = false;
      this.selectedService = null;
      document.body.style.overflow = 'auto';
    }
  }

  // Métodos para CRUD
  goToAddService(): void {
    this.router.navigate(['/service-form']);
  }

  closeModalEdit(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal') || target.classList.contains('close-btn')) {
      this.showModalEdit = false;
      this.selectedService = null;
      this.formEdit.reset();
      document.body.style.overflow = 'auto';
    }
  }

  private initForm(): void {
    this.formEdit = this.fb.group({
      code: [''],
      category: ['CC', Validators.required],
      nameService: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\/().]*$/),
          Validators.maxLength(50),
          Validators.minLength(3)
        ]
      ],
      descriptionService: [
        '',
        [
          Validators.pattern(/^[^\s][\w\sáéíóúÁÉÍÓÚñÑ.,;:+#()\-\/]*$/),
          Validators.maxLength(500),
          Validators.minLength(3) // Cantidad de Caracteres Permitidos 
        ]
      ],
      price: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(6),
          Validators.pattern(/^\d{1,3}(\.\d{0,2})?$/),
          Validators.min(10)
        ]
      ],
      registration_date: [{
        value: this.todayDate
      }]
    });
  }

  private formatToBackendDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onUpdate(): void {
    if (this.formEdit.invalid || !this.selectedService?.code) {
      this.markAllAsTouched();
      return;
    }

    const code = this.selectedService.code;

    Swal.fire({
      title: '¿Actualizar servicio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const serviceData = this.prepareServiceData();
        this.serviceService.update(serviceData).subscribe({
          next: () => {
            this.handleSuccess('¡Actualizado!', 'Servicio modificado con éxito');
            this.loadServices();
            this.resetFilters();
            this.showModalEdit = false;
            this.selectedService = null;
          },
          error: (err) => this.handleError(err)
        });
      }
    });
  }

  private prepareServiceData(): Service {
    const formData = this.formEdit.getRawValue();
    return {
      code: formData.code,
      category: formData.category,
      name_service: formData.nameService,
      description_service: formData.descriptionService,
      price: formData.price,
      registration_date: formData.registration_date,
      state: this.service?.state || true
    };
  }

  private markAllAsTouched(): void {
    Object.values(this.formEdit.controls).forEach(control => {
      control.markAsTouched();
    });
    Swal.fire('Error', 'Por favor complete todos los campos requeridos correctamente', 'error');
  }

  onlyPrice(event: KeyboardEvent, currentValue: string): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

    // Permitir teclas especiales
    if (allowedKeys.includes(event.key)) return;
    const inputChar = event.key;

    // Permitir un solo punto decimal
    if (inputChar === '.' && !currentValue.includes('.')) return;

    // Bloquear si no es número o punto
    if (!/^[0-9.]$/.test(inputChar)) {
      event.preventDefault();
      return;
    }

    // Permite solo 2 decimales
    const [integerPart, decimalPart] = currentValue.split('.');
    if (decimalPart && decimalPart.length >= 2 && currentValue.includes('.') && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    //Permite solo 3 números enteros
    if (!currentValue.includes('.') && integerPart.length >= 3 && inputChar !== '.') {
      event.preventDefault();
      return;
    }
  }

  onlyLetters(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (allowedKeys.includes(event.key)) return;

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\/().]*$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onlyLettersAndSymbol(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (allowedKeys.includes(event.key)) return;

    if (!/^[^\s][\w\sáéíóúÁÉÍÓÚñÑ.,;:+#()\-\/]*$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private handleSuccess(title: string, text: string): void {
    Swal.fire(title, text, 'success');
    this.saved.emit();
    this.formEdit.reset();
    this.initForm();
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

  openModalEdit(service: Service): void {
    this.selectedService = service;
    this.showModalEdit = true;
    document.body.style.overflow = 'hidden';
    this.formEdit.reset();
    this.formEdit.patchValue({
      code: service.code,
      category: service.category,
      nameService: service.name_service,
      descriptionService: service.description_service,
      price: service.price,
      registration_date: service.registration_date
    });
  }

  toggleState(code: string, state: boolean): void {
    const action = state === true ? 'desactivar' : 'activar';
    const actionBtn = state === true ? 'Eliminar' : 'Restaurar';

    Swal.fire({
      title: `¿Deseas ${action} el servicio?`,
      text: 'Esta acción se puede cambiar más adelante',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: actionBtn,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (state) {
          this.serviceService.delete(code).subscribe({
            next: () => {
              Swal.fire('¡Eliminado!', 'Servicio eliminado con éxito', 'success');
              this.saved.emit();
              this.loadServices();
              this.router.navigate(['/services']);
            },
            error: (err) => this.handleError(err)
          });
        } else {
          this.serviceService.restore(code).subscribe({
            next: () => {
              Swal.fire('¡Restaurado!', 'Servicio restaurado con éxito', 'success');
              this.saved.emit();
              this.loadServices();
              this.router.navigate(['/services']);
            },
            error: (err) => this.handleError(err)
          });
        }
      }
    });
  }

  filterBySearch(term: string): void {
    const lowerTerm = term.toLowerCase().trim();

    this.filteredServices = this.services.filter(service =>
      service.code.toLowerCase().includes(lowerTerm) ||
      service.name_service.toLowerCase().includes(lowerTerm)
    );

    this.currentPage = 1;
    this.updatePaginatedServices();
  }

  reportPdf() {
    this.serviceService.reportPdf().subscribe(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte_servicio.pdf';
    link.click();
    URL.revokeObjectURL(url);
    });
  }


}
