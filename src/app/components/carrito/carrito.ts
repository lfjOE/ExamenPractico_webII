// components/carrito/carrito.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../servicios/carrito.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);

  // Lista de 20 productos disponibles
  productosDisponibles: Producto[] = [
    { id: 1, nombre: 'Martillo de Carpintero', precio: 180, descripcion: 'Martillo profesional de acero forjado', imagen: '🔨' },
    { id: 2, nombre: 'Taladro Percutor', precio: 650, descripcion: 'Taladro inalámbrico 20V con 2 baterías', imagen: '🪛' },
    { id: 3, nombre: 'Sierra Circular', precio: 890, descripcion: 'Sierra circular 1800W con láser guía', imagen: '⚙️' },
    { id: 4, nombre: 'Cemento Gris', precio: 120, descripcion: 'Bulto de cemento 50kg tipo Portland', imagen: '🏗️' },
    { id: 5, nombre: 'Arena para Construcción', precio: 85, descripcion: 'M³ de arena lavada para mezcla', imagen: '🏖️' },
    { id: 6, nombre: 'Grava Triturada', precio: 95, descripcion: 'M³ de grava 3/4" para concreto', imagen: '🪨' },
    { id: 7, nombre: 'Ladrillos', precio: 450, descripcion: 'Millar de ladrillos estándar 6 huecos', imagen: '🧱' },
    { id: 8, nombre: 'Bloques de Concreto', precio: 380, descripcion: 'Millar de bloques 15x20x40 cm', imagen: '📦' },
    { id: 9, nombre: 'Varilla Corrugada', precio: 220, descripcion: 'Varilla 1/2" x 12m grado 42', imagen: '📏' },
    { id: 10, nombre: 'Alambre de Amarre', precio: 45, descripcion: 'Rollo alambre negro calibre 16', imagen: '🧵' },
    { id: 11, nombre: 'Pintura Vinílica', precio: 280, descripcion: 'Galón de pintura base agua para interior', imagen: '🎨' },
    { id: 12, nombre: 'Brochas Profesionales', precio: 35, descripcion: 'Set 3 brochas de cerdas naturales', imagen: '🖌️' },
    { id: 13, nombre: 'Escalera de Aluminio', precio: 1250, descripcion: 'Escalera extensible 5.5 metros', imagen: '🪜' },
    { id: 14, nombre: 'Andamio Metálico', precio: 3200, descripcion: 'Juego de andamio para 4 metros de altura', imagen: '🏗️' },
    { id: 15, nombre: 'Carretilla de Obra', precio: 580, descripcion: 'Carretilla metálica capacidad 100L', imagen: '🚜' },
    { id: 16, nombre: 'Mezcladora de Concreto', precio: 4200, descripcion: 'Mezcladora eléctrica 1.5 HP 130L', imagen: '🌀' },
    { id: 17, nombre: 'Nivel Láser', precio: 850, descripcion: 'Nivel láser automático 360 grados', imagen: '📐' },
    { id: 18, nombre: 'Cinta Métrica', precio: 25, descripcion: 'Cinta métrica 8m con freno automático', imagen: '📏' },
    { id: 19, nombre: 'Chaleco de Seguridad', precio: 45, descripcion: 'Chaleco reflectivo talla M', imagen: '🦺' },
    { id: 20, nombre: 'Casco de Obra', precio: 65, descripcion: 'Casco de seguridad con ajuste trasero', imagen: '⛑️' }
  ];

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

    // Generar recibo y XML
    const recibo = this.carritoService.generarRecibo();
    const xml = this.carritoService.generarXML(recibo);

    // Descargar XML
    const filename = `recibo_${recibo.id}.xml`;
    this.carritoService.descargarXML(xml, filename);

    alert(`Compra procesada por $${recibo.total.toFixed(2)}\nRecibo guardado como ${filename}`);

    // Vaciar carrito después de la compra
    this.carritoService.vaciar();
  }
}