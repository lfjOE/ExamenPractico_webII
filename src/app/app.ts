import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CarritoComponent } from './components/carrito/carrito';
import { SignupComponent } from './components/signup/signup';
import { LoginComponent } from './components/login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CarritoComponent, SignupComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  view: 'catalogo' | 'signup' | 'login' = 'catalogo';
  goSignup() { this.view = 'signup'; }
  goLogin() { this.view = 'login'; }
  goCatalogo() { this.view = 'catalogo'; }
}
