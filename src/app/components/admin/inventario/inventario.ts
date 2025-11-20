import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../servicios/inventario.service';
import { ProductoConCantidad } from '../../../models/producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule], // Asegúrate que FormsModule está aquí
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
  productosFiltrados: ProductoConCantidad[] = [];

  // Propiedades para búsqueda
  busquedaId: string = '';
  busquedaActiva: boolean = false;
  mensajeSinResultados: boolean = false;

  // Constantes de validación
  readonly MAX_INT = 2147483647;
  readonly MAX_NOMBRE = 30;
  readonly MAX_DESCRIPCION = 80;
  readonly MIN_PRECIO = 0.01;
  readonly MIN_CANTIDAD = 0;
  readonly MAX_CANTIDAD = 2147483646;

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
      imagen: '🔨',
      vigente: true
    };
  }

  async cargarProductos() {
    try {
      this.isLoading = true;
      this.productosDisponibles = await this.inventarioService.cargarProductosDesdeBD();
      this.productosFiltrados = [...this.productosDisponibles];
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Validación para campos numéricos
  validarCampoNumerico(valor: number, campo: string): { valido: boolean; mensaje: string } {
    if (isNaN(valor) || valor === null || valor === undefined) {
      return { valido: false, mensaje: `${campo} debe ser un número válido` };
    }

    if (campo === 'cantidad') {
      if (valor < this.MIN_CANTIDAD) {
        return { valido: false, mensaje: `La cantidad debe ser mayor o igual a ${this.MIN_CANTIDAD}` };
      }
      if (valor > this.MAX_CANTIDAD) {
        return { valido: false, mensaje: `La cantidad debe ser menor o igual a ${this.MAX_CANTIDAD}` };
      }
      if (!Number.isInteger(valor)) {
        return { valido: false, mensaje: 'La cantidad debe ser un número entero' };
      }
    }

    if (campo === 'precio') {
      if (valor < this.MIN_PRECIO) {
        return { valido: false, mensaje: `El precio debe ser mayor o igual a ${this.MIN_PRECIO}` };
      }
      if (valor > this.MAX_CANTIDAD) {
        return { valido: false, mensaje: `El precio debe ser menor o igual a ${this.MAX_CANTIDAD}` };
      }
    }

    if (campo === 'id') {
      if (valor < 0) {
        return { valido: false, mensaje: 'El ID no puede ser negativo' };
      }
      if (valor >= this.MAX_INT) {
        return { valido: false, mensaje: `El ID debe ser menor a ${this.MAX_INT}` };
      }
    }

    return { valido: true, mensaje: '' };
  }

  // Validación completa de producto
  validarProducto(producto: ProductoConCantidad): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!producto.nombre || producto.nombre.trim() === '') {
      errores.push('El nombre es obligatorio');
    }
    if (!producto.descripcion || producto.descripcion.trim() === '') {
      errores.push('La descripción es obligatoria');
    }
    if (!producto.imagen || producto.imagen.trim() === '') {
      errores.push('La imagen (emoji) es obligatoria');
    }

    if (producto.nombre && producto.nombre.length > this.MAX_NOMBRE) {
      errores.push(`El nombre debe tener máximo ${this.MAX_NOMBRE} caracteres`);
    }
    if (producto.descripcion && producto.descripcion.length > this.MAX_DESCRIPCION) {
      errores.push(`La descripción debe tener máximo ${this.MAX_DESCRIPCION} caracteres`);
    }

    const validacionCantidad = this.validarCampoNumerico(producto.cantidad, 'cantidad');
    if (!validacionCantidad.valido) {
      errores.push(validacionCantidad.mensaje);
    }

    const validacionPrecio = this.validarCampoNumerico(producto.precio, 'precio');
    if (!validacionPrecio.valido) {
      errores.push(validacionPrecio.mensaje);
    }

    if (producto.id_producto) {
      const validacionId = this.validarCampoNumerico(producto.id_producto, 'id');
      if (!validacionId.valido) {
        errores.push(validacionId.mensaje);
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  // Manejadores de entrada mejorados
  onCantidadChange(event: Event, esEdicion: boolean = false): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const numero = valor === '' ? 0 : parseInt(valor);

    if (isNaN(numero)) {
      return; // No hacer nada si no es un número
    }

    const validacion = this.validarCampoNumerico(numero, 'cantidad');

    if (esEdicion && this.productoEditando) {
      if (validacion.valido) {
        this.productoEditando.cantidad = numero;
      }
    } else if (!esEdicion) {
      if (validacion.valido) {
        this.productoNuevo.cantidad = numero;
      }
    }
  }

  onPrecioChange(event: Event, esEdicion: boolean = false): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const numero = valor === '' ? 0 : parseFloat(valor);

    if (isNaN(numero)) {
      return;
    }

    const validacion = this.validarCampoNumerico(numero, 'precio');

    if (esEdicion && this.productoEditando) {
      if (validacion.valido) {
        this.productoEditando.precio = numero;
      }
    } else if (!esEdicion) {
      if (validacion.valido) {
        this.productoNuevo.precio = numero;
      }
    }
  }

  // Resto de métodos se mantienen igual...
  buscarPorId() {
    this.mensajeSinResultados = false;

    if (!this.busquedaId || this.busquedaId.trim() === '') {
      this.limpiarBusqueda();
      return;
    }

    const idBuscado = parseInt(this.busquedaId.trim());
    const validacion = this.validarCampoNumerico(idBuscado, 'id');

    if (!validacion.valido) {
      this.mensajeSinResultados = true;
      this.productosFiltrados = [];
      this.busquedaActiva = true;
      return;
    }

    const productoEncontrado = this.productosDisponibles.find(
      p => p.id_producto === idBuscado
    );

    if (productoEncontrado) {
      this.productosFiltrados = [productoEncontrado];
      this.busquedaActiva = true;
      this.mensajeSinResultados = false;
    } else {
      this.productosFiltrados = [];
      this.busquedaActiva = true;
      this.mensajeSinResultados = true;
    }
  }

  limpiarBusqueda() {
    this.busquedaId = '';
    this.busquedaActiva = false;
    this.mensajeSinResultados = false;
    this.productosFiltrados = [...this.productosDisponibles];
  }

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
      const validacion = this.validarProducto(this.productoEditando);

      if (!validacion.valido) {
        alert('Errores de validación:\n\n' + validacion.errores.join('\n'));
        return;
      }

      try {
        const success = await this.inventarioService.actualizarProducto(this.productoEditando);
        if (success) {
          const index = this.productosDisponibles.findIndex(
            p => p.id_producto === this.productoEditando!.id_producto
          );
          if (index !== -1) {
            this.productosDisponibles[index] = { ...this.productoEditando };
          }

          if (this.busquedaActiva) {
            this.buscarPorId();
          } else {
            this.productosFiltrados = [...this.productosDisponibles];
          }

          this.cerrarModalEditar();
          alert('Producto actualizado correctamente');
        }
      } catch (error) {
        console.error('Error al actualizar producto:', error);
        alert('Error al actualizar el producto en la base de datos');
      }
    }
  }

  abrirModalCrear() {
    this.productoNuevo = this.inicializarProductoNuevo();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.productoNuevo = this.inicializarProductoNuevo();
  }

  async crearProducto() {
    const validacion = this.validarProducto(this.productoNuevo);

    if (!validacion.valido) {
      alert('Errores de validación:\n\n' + validacion.errores.join('\n'));
      return;
    }

    try {
      const nuevoProducto = await this.inventarioService.crearProducto(this.productoNuevo);
      if (nuevoProducto) {
        this.productosDisponibles.push(nuevoProducto);

        if (this.busquedaActiva) {
          this.buscarPorId();
        } else {
          this.productosFiltrados = [...this.productosDisponibles];
        }

        this.cerrarModalCrear();
        alert('Producto creado correctamente');
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto en la base de datos');
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
          const indexOriginal = this.productosDisponibles.findIndex(
            p => p.id_producto === id
          );

          if (indexOriginal !== -1) {
            this.productosDisponibles.splice(indexOriginal, 1);
          }

          if (this.busquedaActiva) {
            this.buscarPorId();
          } else {
            this.productosFiltrados = [...this.productosDisponibles];
          }

          alert('Producto eliminado correctamente');
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto de la base de datos');
      }
    }
  }

  toggleVigencia(producto: ProductoConCantidad) {
    producto.vigente = !producto.vigente;
  }
}