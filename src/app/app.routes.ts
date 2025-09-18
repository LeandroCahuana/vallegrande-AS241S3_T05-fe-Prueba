import { Routes } from '@angular/router';

// Importar componentes
import { Home } from './feature/home/home';
import { Client } from './feature/client/client';
import { Data } from './feature/data/data';
import { Users } from './feature/users/users';
import { Product } from './feature/product/product';
import { Supplier } from './feature/supplier/supplier';
import { Service } from './feature/service/service';
import { Reservations } from './feature/reservations/reservations';
import { Report } from './feature/report/report';
import { login } from './feature/login/login';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: 'client', component: Client },
    { path: 'data', component: Data },
    { path: 'users', component: Users },
    { path: 'products', component: Product },
    { path: 'suppliers', component: Supplier },
    { path: 'services', component: Service },
    { path: 'reservations', component: Reservations },
    { path: 'report', component: Report },
    { path: 'login', component: login },

    // Ruta por defecto
    { path: '', pathMatch: 'full', redirectTo: 'login' },

    // Ruta comodín por si no se encuentra la URL
    { path: '**', redirectTo: 'login' }
];
