import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { CarritoComponent } from './components/carrito/carrito';
import { RouterOutlet } from "@angular/router";
import { ForgotPassword } from './components/forgot-password/forgot-password';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.auth.hydrate();
  }

  isOnCatalogoPage(): boolean {
    return this.router.url === '/';
  }

  isOnAuthPage(): boolean {
    return ['/login', '/signup', '/forgot-password'].includes(this.router.url);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  isLoggedIn(): boolean { return this.auth.isLoggedIn(); }
}