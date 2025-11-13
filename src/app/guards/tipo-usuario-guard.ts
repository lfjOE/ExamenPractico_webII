import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class TipoUsuarioGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const tipoRequerido = route.data['tipo'];
    const usuario = this.authService.user();

    if (!tipoRequerido) {
      return true;
    }


    if (!usuario) {
      return this.router.parseUrl('/login');
    }

    if (usuario.tipo !== tipoRequerido) {
      return this.router.parseUrl('/no-autorizado');
    }

    return true;
  }
}
