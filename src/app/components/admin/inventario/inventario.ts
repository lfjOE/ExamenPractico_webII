import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../servicios/inventario.service';
import { ProductoConCantidad } from '../../../models/producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario {
  inventarioService = inject(InventarioService);

  productoEditando: ProductoConCantidad | null = null;
  productoNuevo: ProductoConCantidad = this.inicializarProductoNuevo();
  mostrarModalEditar: boolean = false;
  mostrarModalCrear: boolean = false;
  isLoading: boolean = false;
  productosDisponibles: ProductoConCantidad[] = [];

  emojisSugeridos: string[] = [
    '🔨', '🪚', '⛏️', '🪛', '🔧', '🛠️', '⚒️', '🪓',
    '🧰', '🔩', '⚙️', '⛓️', '🔗', '🧱', '🪜', '🛢️',
    '🚪', '🪟', '💡', '🔌', '🪫', '🔋', '🚿', '🚽',
    '🪠', '🧹', '🧴', '🪣', '🧽', '📏', '📐', '⚖️',
    '🏗️', '🚧', '🛑', '📦', '🧲', '🪤', '🪒', '🔪',
    '✂️', '🪡', '🧵', '🧶', '🪢', '🔦', '💎', '🪨'
  ];

  constructor() {
    this.cargarProductos();
  }

  inicializarProductoNuevo(): ProductoConCantidad {
    return {
      id_producto: 0,
      nombre: '',
      precio: 0,
      descripcion: '',
      cantidad: 0,
      imagen: '🔨'
    };
  }

  async cargarProductos() {
    try {
      this.isLoading = true;
      this.productosDisponibles = await this.inventarioService.cargarProductosDesdeBD();
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Modal de Editar
  editarProducto(producto: ProductoConCantidad) {
    this.productoEditando = { ...producto };
    this.mostrarModalEditar = true;
  }

  seleccionarEmoji(emoji: string, esNuevoProducto: boolean = false) {
    if (esNuevoProducto) {
      this.productoNuevo.imagen = emoji;
    } else if (this.productoEditando) {
      this.productoEditando.imagen = emoji;
    }
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.productoEditando = null;
  }

  async guardarCambios() {
    if (this.productoEditando) {
      try {
        const success = await this.inventarioService.actualizarProducto(this.productoEditando);
        if (success) {
          const index = this.productosDisponibles.findIndex(
            p => p.id_producto === this.productoEditando!.id_producto
          );
          if (index !== -1) {
            this.productosDisponibles[index] = { ...this.productoEditando };
          }
          this.cerrarModalEditar();
          alert('Producto actualizado correctamente');
        }
      } catch (error) {
        console.error('Error al actualizar producto:', error);
        alert('Error al actualizar el producto');
      }
    }
  }

  // Modal de Crear
  abrirModalCrear() {
    this.productoNuevo = this.inicializarProductoNuevo();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.productoNuevo = this.inicializarProductoNuevo();
  }

  async crearProducto() {
    try {
      const nuevoProducto = await this.inventarioService.crearProducto(this.productoNuevo);
      if (nuevoProducto) {
        this.productosDisponibles.push(nuevoProducto);
        this.cerrarModalCrear();
        alert('Producto creado correctamente');
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto');
    }
  }

  async eliminarProducto(id: number | undefined, index: number) {
    if (!id) {
      alert('Error: ID del producto no válido');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const success = await this.inventarioService.eliminarProducto(id);
        if (success) {
          this.productosDisponibles.splice(index, 1);
          alert('Producto eliminado correctamente');
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  }
}