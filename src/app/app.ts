import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { UiStateService, View } from './ui-state.service';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { CarritoComponent } from './components/carrito/carrito';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, SignupComponent, CarritoComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  view: View = 'catalogo';

  constructor(public auth: AuthService, private ui: UiStateService) {}

  ngOnInit(): void {
    this.auth.hydrate();
    this.view = this.ui.getView();
  }

  goCatalogo(): void { this.ui.setView('catalogo'); this.view = 'catalogo'; }
  goLogin(): void { this.ui.setView('login'); this.view = 'login'; }
  goSignup(): void { this.ui.setView('signup'); this.view = 'signup'; }
  isLoggedIn(): boolean { return this.auth.isLoggedIn(); }
  logout(): void { this.auth.logout(); this.goCatalogo(); }
}
