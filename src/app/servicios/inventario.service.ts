import { Injectable, signal } from '@angular/core';
import { ProductoConCantidad } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private apiUrl = 'http://localhost:4000/api/catalogo/productos';
  productos = signal<ProductoConCantidad[]>([]);

  // Convertir de BD (1/0) a Frontend (true/false)
  private convertirProductoDesdeBD(producto: any): ProductoConCantidad {
    const vigente = producto.vigente === 1 || producto.vigente === '1' || producto.vigente === true;
    console.log(`Convirtiendo producto ${producto.nombre}: vigente=${producto.vigente} (${typeof producto.vigente}) -> ${vigente}`);

    return {
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      cantidad: producto.cantidad,
      imagen: producto.imagen,
      vigente: vigente
    };
  }

  // Convertir de Frontend (true/false) a BD (1/0)
  private convertirProductoParaBD(producto: ProductoConCantidad): any {
    return {
      ...producto,
      vigente: producto.vigente ? 1 : 0
    };
  }

  // RQNF38: Cargar productos desde BD
  async cargarProductosDesdeBD(): Promise<ProductoConCantidad[]> {
    const response = await fetch('http://localhost:4000/api/inventario/inventario');
    if (!response.ok) throw new Error('HTTP ' + response.status);

    console.log(response);
    const productos = await response.json();

    // Convertir vigente de 1/0 a true/false
    return productos.map((p: any) => this.convertirProductoDesdeBD(p));
  }

  // RQNF31-36: Crear producto con validaciones
  async crearProducto(productoNuevo: ProductoConCantidad) {
    // Convertir vigente de true/false a 1/0 antes de enviar
    const productoParaBD = this.convertirProductoParaBD(productoNuevo);

    const response = await fetch("http://localhost:4000/api/inventario/agregar", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoParaBD)
    });

    if (!response.ok) {
      throw new Error('No se pudo crear el producto');
    }

    const productoCreado = await response.json();
    // Convertir la respuesta de vuelta a formato frontend
    return this.convertirProductoDesdeBD(productoCreado);
  }

  // RQNF41: Eliminar producto de BD
  async eliminarProducto(id: number) {
    const response = await fetch("http://localhost:4000/api/inventario/eliminar", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    });

    if (!response.ok) {
      return false;
    }
    return true;
  }

  // RQNF39-40: Actualizar producto con validaciones
  async actualizarProducto(productoEditando: ProductoConCantidad) {
    const productoParaBD = this.convertirProductoParaBD(productoEditando);

    const response = await fetch("http://localhost:4000/api/inventario/editar", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoParaBD)
    });

    if (!response.ok) {
      return false;
    }
    return true;
  }

  // RQNF42: Reducir inventario después de un pedido
  async reducirInventarioPorPedido(
    productos: { id_producto: number; cantidad: number }[]
  ): Promise<{ success: boolean; errores?: string[] }> {
    const errores: string[] = [];

    try {
      // Cargar productos actuales
      const productosActuales = await this.cargarProductosDesdeBD();

      // Validar stock disponible
      for (const item of productos) {
        const producto = productosActuales.find(p => p.id_producto === item.id_producto);

        if (!producto) {
          errores.push(`Producto con ID ${item.id_producto} no encontrado`);
          continue;
        }

        if (producto.cantidad < item.cantidad) {
          errores.push(
            `Stock insuficiente para ${producto.nombre}. ` +
            `Disponible: ${producto.cantidad}, Solicitado: ${item.cantidad}`
          );
          continue;
        }

        // Actualizar cantidad
        producto.cantidad -= item.cantidad;

        // Guardar cambios en BD
        const actualizado = await this.actualizarProducto(producto);
        if (!actualizado) {
          errores.push(`Error al actualizar ${producto.nombre}`);
        }
      }

      return {
        success: errores.length === 0,
        errores: errores.length > 0 ? errores : undefined
      };
    } catch (error) {
      console.error('Error en reducirInventarioPorPedido:', error);
      return {
        success: false,
        errores: ['Error al procesar la actualización del inventario']
      };
    }
  }

  // Obtener producto por ID (útil para búsquedas)
  async obtenerProductoPorId(id: number): Promise<ProductoConCantidad | null> {
    try {
      const productos = await this.cargarProductosDesdeBD();
      return productos.find(p => p.id_producto === id) || null;
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      return null;
    }
  }

  // Obtener solo productos vigentes (vigente = 1 en BD)
  async obtenerProductosVigentes(): Promise<ProductoConCantidad[]> {
    try {
      const productos = await this.cargarProductosDesdeBD();
      return productos.filter(p => p.vigente === true);
    } catch (error) {
      console.error('Error al obtener productos vigentes:', error);
      return [];
    }
  }
}