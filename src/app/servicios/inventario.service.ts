import { Injectable, signal } from '@angular/core';
import { ProductoConCantidad } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {



  private apiUrl = 'http://localhost:4000/api/catalogo/productos';

  productos = signal<ProductoConCantidad[]>([]);


  async cargarProductosDesdeBD(): Promise<ProductoConCantidad[]> {
    const response = await fetch('http://localhost:4000/api/inventario/inventario');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    console.log(response);
    const productos = await response.json();
    return productos as ProductoConCantidad[];
  }

  async crearProducto(productoNuevo: ProductoConCantidad) {
    const response = await fetch("http://localhost:4000/api/inventario/agregar", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoNuevo)
    });

    if (!response.ok) {
      throw new Error('No se pudo crear el producto');
    }
    return productoNuevo;
  }

  eliminarProducto(id: number) {
    return true;
    throw new Error('Method not implemented.');
  }

  async actualizarProducto(productoEditando: ProductoConCantidad) {
    const response = await fetch("http://localhost:4000/api/inventario/editar", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoEditando)
    })

    if (!response.ok) {
      return false;
    }
    return true;
  }
}