import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { CarritoComponent } from './components/carrito/carrito';
import { ResetPassword } from './components/reset-password/reset-password';
import { TipoUsuarioGuard } from './guards/tipo-usuario-guard';
import { AdminPanel } from './components/admin/admin-panel/admin-panel';
import { Inventario } from './components/admin/inventario/inventario';
import { ListaRepartidores } from './components/admin/lista-repartidores/lista-repartidores';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy';
import { TermsConditionsComponent } from './components/terms-conditions/terms-conditions';

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
        component: ListaRepartidores,
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
        path: 'privacy',
        component: PrivacyPolicyComponent,
        title: 'Aviso de Privacidad'
    },
    {
        path: 'terms',
        component: TermsConditionsComponent,
        title: 'Términos y Condiciones'
    },
    {
        path: '**',
        redirectTo: ''
    }
];