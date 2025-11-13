import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { CarritoComponent } from './components/carrito/carrito';
import { ResetPassword } from './components/reset-password/reset-password';
import { TipoUsuarioGuard } from './guards/tipo-usuario-guard';
import { AdminPanel } from './components/admin/admin-panel/admin-panel';
import { Repatidores } from './components/admin/repatidores/repatidores';
import { Inventario } from './components/admin/inventario/inventario';

export const routes: Routes = [
    {
        path: '',
        component: CarritoComponent,
        title: 'Catálogo',
        canActivate: [TipoUsuarioGuard],
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
        path: 'admin',
        component: AdminPanel,
        title: 'Panel de Administración',
        canActivate: [TipoUsuarioGuard],
        data: { tipo: 'admin' }
    },
    {
        path: 'admin/repartidores',
        component: Repatidores,
        canActivate: [TipoUsuarioGuard],
        data: { tipo: 'admin' },
        title: 'Gestión de Repartidores'
    },
    {
        path: 'admin/inventario',
        component: Inventario,
        canActivate: [TipoUsuarioGuard],
        data: { tipo: 'admin' },
        title: 'Gestión de Inventario'
    },
    {
        path: '**',
        redirectTo: ''
    }

];