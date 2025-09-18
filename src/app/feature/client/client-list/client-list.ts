import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/interfaces/client';
import Swal from 'sweetalert2';

interface MonthOption {
  value: string;
  name: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './client-list.html',
  styleUrls: ['./client-list.scss']
})
export class ClientList implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  paginatedClients: Client[] = [];

  frequencyFilter = '';
  statusFilter = '';
  birthdayMonthFilter = '';
  sortOrder = '';

  currentPage = 1;
  itemsPerPage = 7;

  showModal = false;
  isViewMode = false;
  selectedClient: Client | null = null;
  highlightedClientId: number | null = null;

  clientForm!: FormGroup;

  months: MonthOption[] = [
    { value: '1', name: 'Enero' }, { value: '2', name: 'Febrero' }, { value: '3', name: 'Marzo' },
    { value: '4', name: 'Abril' }, { value: '5', name: 'Mayo' }, { value: '6', name: 'Junio' },
    { value: '7', name: 'Julio' }, { value: '8', name: 'Agosto' }, { value: '9', name: 'Septiembre' },
    { value: '10', name: 'Octubre' }, { value: '11', name: 'Noviembre' }, { value: '12', name: 'Diciembre' }
  ];

  private router = inject(Router);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.loadClients();
    this.initForm();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      id: [null],
      typeDocument: ['', Validators.required],
      numberDocument: ['', Validators.required],
      nameClient: ['', Validators.required],
      lastname: ['', Validators.required],
      birthday: ['', Validators.required],
      visitFrequency: ['', Validators.required],
      cellphone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      email: ['', [Validators.required, Validators.email]],
      addressClient: ['', Validators.required],
      registrationDate: [''],
      state: [''],
    });
  }

  loadClients(): void {
    this.clientService.findAll().subscribe({
      next: (response) => {
        this.clients = [...response].reverse();
        this.applyFilters();
      },
      error: () => {
        // fallback con datos de prueba
        this.clients = [
          {
            id: 1,
            imageUrl: 'https://i.pinimg.com/736x/bb/65/bd/bb65bdeab14fcb2e332edcdfae569465.jpg',
            typeDocument: 'DNI',
            numberDocument: 74859632,
            nameClient: 'Mariana',
            lastname: 'Fernández',
            birthday: new Date(1992, 5, 12),
            cellphone: 987654321,
            email: 'mariana.fernandez@example.com',
            registrationDate: new Date(2024, 10, 5),
            addressClient: 'Av. Los Olivos 123, Lima',
            state: 'A',
            visitFrequency: 'F'
          },
          {
            id: 2,
            imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
            typeDocument: 'DNI',
            numberDocument: 65412398,
            nameClient: 'Carlos',
            lastname: 'Ramos',
            birthday: new Date(1988, 2, 22),
            cellphone: 912345678,
            email: 'carlos.ramos@example.com',
            registrationDate: new Date(2024, 6, 14),
            addressClient: 'Jr. Los Pinos 456, Arequipa',
            state: 'I',
            visitFrequency: 'O'
          },
          {
            id: 3,
            imageUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
            typeDocument: 'CE',
            numberDocument: 99887766,
            nameClient: 'Sofía',
            lastname: 'Lopez',
            birthday: new Date(1995, 8, 30),
            cellphone: 976543210,
            email: 'sofia.lopez@example.com',
            registrationDate: new Date(2025, 0, 10),
            addressClient: 'Calle Las Flores 789, Cusco',
            state: 'A',
            visitFrequency: 'N'
          },
          {
            id: 4,
            imageUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
            typeDocument: 'DNI',
            numberDocument: 44556677,
            nameClient: 'Andrés',
            lastname: 'Ramírez',
            birthday: new Date(1988, 4, 12), // Mayo es 4 porque empieza en 0
            cellphone: 987654321,
            email: 'andres.ramirez@example.com',
            registrationDate: new Date(2025, 1, 5), // Febrero 5
            addressClient: 'Av. Los Olivos 456, Arequipa',
            state: 'I',
            visitFrequency: 'F'
          }
        ];
        this.applyFilters();

        Swal.fire('Aviso', 'No se pudieron cargar los clientes del servidor. Mostrando datos de prueba.', 'info');
      }
    });
  }

  applyFilters(): void {
    this.filteredClients = this.clients.filter(client => {
      const matchesFrequency = !this.frequencyFilter || client.visitFrequency === this.frequencyFilter;
      const matchesStatus = !this.statusFilter || client.state?.toUpperCase() === this.statusFilter;
      const matchesBirthday = !this.birthdayMonthFilter ||
        (new Date(client.birthday).getMonth() + 1).toString() === this.birthdayMonthFilter;
      return matchesFrequency && matchesStatus && matchesBirthday;
    });

    if (this.sortOrder === 'az') {
      this.filteredClients.sort((a, b) => a.nameClient.localeCompare(b.nameClient));
    } else if (this.sortOrder === 'za') {
      this.filteredClients.sort((a, b) => b.nameClient.localeCompare(a.nameClient));
    }

    this.updatePaginatedClients();
  }

  resetFilters(): void {
    this.frequencyFilter = '';
    this.statusFilter = '';
    this.birthdayMonthFilter = '';
    this.sortOrder = '';
    this.applyFilters();
  }

  updatePaginatedClients(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedClients();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedClients();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClients.length / this.itemsPerPage);
  }

  openModal(client: Client, viewOnly: boolean = false): void {
    this.selectedClient = client;
    this.isViewMode = viewOnly;
    this.clientForm.patchValue(client);
    this.clientForm[viewOnly ? 'disable' : 'enable']();
    this.showModal = true;

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal') || target.classList.contains('close-btn')) {
      this.showModal = false;
      this.clientForm.reset();
      this.isViewMode = false;

      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = 'auto';
      }
    }
  }

  viewClient(client: Client): void {
    this.openModal(client, true);
  }

  editClient(client: Client): void {
    this.openModal(client, false);
  }

  saveChanges(): void {
    if (this.isViewMode) return;

    if (this.clientForm.invalid) {
      Swal.fire({
        title: 'Atención',
        text: 'Completa todos los campos correctamente.',
        icon: 'warning',
        iconColor: '#80A7A3',
        confirmButtonColor: '#FED4C6',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const updatedClient = this.clientForm.value as Client;

    if (!updatedClient.id) {
      this.clientService.save(updatedClient).subscribe({
        next: (newClient) => {
          this.highlightedClientId = newClient.id ?? null;
          this.clientForm.reset();
          this.showModal = false;
          this.loadClientsAndJumpTo(newClient.id!);
          setTimeout(() => this.highlightedClientId = null, 4000);

          Swal.fire({
            title: '¡Éxito!',
            text: 'Cliente registrado correctamente.',
            icon: 'success',
            iconColor: '#FED4C6',
            confirmButtonColor: '#80A7A3',
            confirmButtonText: 'Aceptar'
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el cliente',
            icon: 'error',
            iconColor: '#80A7A3',
            confirmButtonColor: '#FED4C6',
            confirmButtonText: 'Cerrar'
          });
        }
      });
    } else {
      this.clientService.update(updatedClient.id, updatedClient).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Cliente actualizado correctamente.',
            icon: 'success',
            iconColor: '#FED4C6',
            confirmButtonColor: '#80A7A3',
            confirmButtonText: 'Aceptar'
          });
          this.showModal = false;
          this.loadClientsAndJumpTo(updatedClient.id!);
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el cliente',
            icon: 'error',
            iconColor: '#80A7A3',
            confirmButtonColor: '#FED4C6',
            confirmButtonText: 'Cerrar'
          });
        }
      });
    }
  }

  toggleState(client: Client): void {
    if (!client.id) return;

    const isActive = client.state?.toUpperCase() === 'A';
    const action = isActive ? 'desactivar' : 'activar';
    const actionDone = isActive ? 'desactivado' : 'activado';

    Swal.fire({
      title: `¿Deseas ${action} al cliente?`,
      icon: 'question',
      iconColor: '#80A7A3',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#80A7A3',
      cancelButtonColor: '#FED4C6'
    }).then(result => {
      if (result.isConfirmed) {
        const toggleAction = isActive
          ? this.clientService.delete(client.id!)
          : this.clientService.restore(client.id!);

        toggleAction.subscribe({
          next: () => {
            Swal.fire('¡Éxito!', `Cliente ${actionDone}.`, 'success');
            this.loadClientsAndJumpTo(client.id!);
            this.highlightedClientId = client.id!;
            setTimeout(() => this.highlightedClientId = null, 4000);
          },
          error: () => {
            Swal.fire('Error', 'No se pudo cambiar el estado del cliente', 'error');
          }
        });
      }
    });
  }

  private loadClientsAndJumpTo(id: number): void {
    this.clientService.findAll().subscribe({
      next: (clients) => {
        this.clients = [...clients].reverse();
        this.applyFilters();
        const index = this.filteredClients.findIndex(c => c.id === id);
        if (index !== -1) {
          this.currentPage = Math.floor(index / this.itemsPerPage) + 1;
          this.updatePaginatedClients();
        }
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
    });
  }

  reportPdf() {
    this.clientService.reportPdf().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte_clientes.pdf';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}
