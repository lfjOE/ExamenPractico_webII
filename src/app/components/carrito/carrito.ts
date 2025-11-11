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

  async procederCompra() {
  if (this.carritoService.productos().length === 0) {
    alert('El carrito está vacío');
    return;
  }

  const raw = localStorage.getItem('materialhub_user');
  const user = raw ? JSON.parse(raw) : null;
  const user_id = user?.user_id ?? 0;
  if (!user_id) { alert('Inicia sesión para completar la compra'); return; }

  const productos = (this.carritoService.productos() || []).map(p => ({
    id_producto: p.id_producto,
    cantidad: 1
  }));

  try {
    const res = await fetch('http://localhost:4000/api/pedidos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, productos, repartidor_id: 1 })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Error al crear pedido');

    const recibo = this.carritoService.generarRecibo();
    const xml = this.carritoService.generarXML(recibo);
    const filename = `recibo_${recibo.id}.xml`;
    this.carritoService.descargarXML(xml, filename);

    alert(`Pedido #${data.id_pedido} creado. Compra por $${recibo.total.toFixed(2)}. Recibo guardado como ${filename}`);
    this.carritoService.vaciar();
  } catch (e: any) {
    alert(e?.message || 'Error al crear pedido');
  }
}

}