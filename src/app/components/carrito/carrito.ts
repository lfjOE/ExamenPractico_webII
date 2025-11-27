import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../servicios/carrito.service';
import { ProductoConCantidad } from '../../models/producto';
import { NgxPayPalModule } from "ngx-paypal";
import { Paypal } from '../paypal/paypal';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, NgxPayPalModule, Paypal, FooterComponent],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);

  productosDisponibles: ProductoConCantidad[] = [];

  constructor() {
    this.cargarProductos();
  }

  async cargarProductos() {
    this.productosDisponibles = await this.carritoService.cargarProductosDesdeBD();

    this.productosDisponibles = this.productosDisponibles.filter(p => p.vigente === true || p.vigente === 1);
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.carritoService.vaciar();
    }
  }

  agregarProducto(producto: ProductoConCantidad) {
    this.carritoService.agregar(producto);
  }

  aumentarCantidad(id_producto: number) {
    this.carritoService.aumentarCantidad(id_producto);
  }

  disminuirCantidad(id_producto: number) {
    this.carritoService.disminuirCantidad(id_producto);
  }

  obtenerStockDisponible(id_producto: number): number {
    const producto = this.productosDisponibles.find(p => p.id_producto === id_producto);
    return producto?.cantidad || 0;
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
      cantidad: p.cantidad || 1
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