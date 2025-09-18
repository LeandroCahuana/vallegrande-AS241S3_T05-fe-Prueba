import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loader } from "../../shared/nire-spa-loader/nire-spa-loader";
import { LoginService } from '../../core/services/login.service';
import { Login } from '../../core/interfaces/login';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, Loader]
})
export class login implements OnInit {
  email: string = '';
  passwordUser: string = '';
  showPassword: boolean = false;
  rememberPassword: boolean = false;
  showForgotPasswordMessage: boolean = false;
  isForgotPasswordClicked: boolean = false;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRememberPassword(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.rememberPassword = checkbox.checked;
  }

  showForgotPasswordAlert() {
    this.isForgotPasswordClicked = true;
    this.showForgotPasswordMessage = true;

    setTimeout(() => {
      this.isForgotPasswordClicked = false;
    }, 600);

    setTimeout(() => {
      this.showForgotPasswordMessage = false;
    }, 3000);
  }

  login() {
    this.isLoading = true;

    if (!this.email || !this.passwordUser) {
      this.isLoading = false;
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }

    this.loginService.login({ email: this.email, passwordUser: this.passwordUser }).subscribe({
      next: (user: Login) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          showConfirmButton: false,
          timer: 1500
        });
        this.redirectByRole(user.roleUser);
      },
      error: (err: string) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Contraseña incorrecta',
          text: err || 'Revisa tu correo y contraseña.',
          confirmButtonColor: '#80A7A3'
        });
      }
    });
  }

  redirectByRole(role: string): void {
    switch (role) {
      case '1': // Admin
        this.router.navigate(['/home']);
        break;
      case '2': // Recepcionista
        this.router.navigate(['/home']);
        break;
      case '3': // Empleado
        this.router.navigate(['/home']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
