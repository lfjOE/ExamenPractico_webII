import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { CarritoComponent } from './components/carrito/carrito';
import { ResetPassword } from './components/reset-password/reset-password';

export const routes: Routes = [
    {
        path: '',
        component: CarritoComponent,
        title: 'Catálogo'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Iniciar Sesión'
    },
    {
        path: 'signup',
        component: SignupComponent,
        title: 'Crear Cuenta'
    },
    {
        path: 'forgot-password',
        component: ForgotPassword,
        title: 'Recuperar Contraseña'
    },
    {
        path: "reset-password",
        component: ResetPassword,
        title: 'Restablecer Contraseña'
    },
    {
        path: '**',
        redirectTo: ''
    }
];