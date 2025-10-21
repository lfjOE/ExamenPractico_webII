import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../servicios/carrito.service';
import { Producto } from '../../models/producto';
import { NgxPayPalModule } from "ngx-paypal";
import { Paypal } from '../paypal/paypal';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, NgxPayPalModule, Paypal],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);

  productosDisponibles: Producto[] = [];

  constructor() {
    this.cargarProductos();
  }

  async cargarProductos() {
    this.productosDisponibles = await this.carritoService.cargarProductosDesdeBD();
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.carritoService.vaciar();
    }
  }

  agregarProducto(producto: Producto) {
    this.carritoService.agregar(producto);
  }

  procederCompra() {
    if (this.carritoService.productos().length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const recibo = this.carritoService.generarRecibo();
    const xml = this.carritoService.generarXML(recibo);

    const filename = `recibo_${recibo.id}.xml`;
    this.carritoService.descargarXML(xml, filename);

    alert(`Compra procesada por $${recibo.total.toFixed(2)}\nRecibo guardado como ${filename}`);

    this.carritoService.vaciar();
  }
}