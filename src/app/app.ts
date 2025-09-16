import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarritoComponent } from './components/carrito/carrito';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CarritoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'mi-tienda';
}