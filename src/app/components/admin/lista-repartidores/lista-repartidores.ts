import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaRepartidoresService } from '../../../servicios/lista-repartidores.service';

@Component({
  selector: 'app-lista-repartidores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-repartidores.html',
  styleUrl: './lista-repartidores.css'
})
export class ListaRepartidores {
  repartidoresService = inject(ListaRepartidoresService);

  repartidorEditando: Repartidor | null = null;
  repartidorNuevo: Repartidor = this.inicializarRepartidorNuevo();
  mostrarModalEditar: boolean = false;
  mostrarModalCrear: boolean = false;
  isLoading: boolean = false;
  repartidoresDisponibles: Repartidor[] = [];
  repartidoresFiltrados: Repartidor[] = [];

  // Propiedades para búsqueda
  busquedaNombre: string = '';
  busquedaActiva: boolean = false;
  mensajeSinResultados: boolean = false;

  // Constantes de validación
  readonly MAX_NOMBRE = 50;
  readonly MAX_APELLIDOS = 50;
  readonly MAX_EMAIL = 100;
  readonly MAX_CODIGO_PAIS = 5;
  readonly MAX_TELEFONO = 15;
  readonly MAX_MUNICIPIO = 50;
  readonly MIN_EDAD = 18;

  // Municipios de Jalisco
  readonly municipiosJalisco: string[] = [
    'Acatic', 'Acatlán de Juárez', 'Ahualulco de Mercado', 'Amacueca', 'Amatitán',
    'Ameca', 'Arandas', 'Atemajac de Brizuela', 'Atengo', 'Atenguillo',
    'Atotonilco el Alto', 'Atoyac', 'Autlán de Navarro', 'Ayotlán', 'Ayutla',
    'Bolaños', 'Cabo Corrientes', 'Cañadas de Obregón', 'Casimiro Castillo',
    'Chapala', 'Chimaltitán', 'Chiquilistlán', 'Cihuatlán', 'Cocula',
    'Colotlán', 'Concepción de Buenos Aires', 'Cuautitlán de García Barragán',
    'Cuautla', 'Cuquío', 'Degollado', 'Ejutla', 'El Arenal', 'El Grullo',
    'El Limón', 'El Salto', 'Encarnación de Díaz', 'Etzatlán', 'Gómez Farías',
    'Guachinango', 'Guadalajara', 'Hostotipaquillo', 'Huejúcar', 'Huejuquilla el Alto',
    'Ixtlahuacán de los Membrillos', 'Ixtlahuacán del Río', 'Jalostotitlán',
    'Jamay', 'Jesús María', 'Jilotlán de los Dolores', 'Jocotepec', 'Juanacatlán',
    'Juchitlán', 'La Barca', 'La Huerta', 'La Manzanilla de la Paz',
    'Lagos de Moreno', 'Magdalena', 'Mascota', 'Mazamitla', 'Mexticacán',
    'Mezquitic', 'Mixtlán', 'Ocotlán', 'Ojuelos de Jalisco', 'Pihuamo',
    'Poncitlán', 'Puerto Vallarta', 'Quitupan', 'San Cristóbal de la Barranca',
    'San Diego de Alejandría', 'San Gabriel', 'San Juan de los Lagos',
    'San Juanito de Escobedo', 'San Julián', 'San Marcos', 'San Martín de Bolaños',
    'San Martín Hidalgo', 'San Miguel el Alto', 'San Sebastián del Oeste',
    'Santa María de los Ángeles', 'Santa María del Oro', 'Sayula',
    'Tala', 'Talpa de Allende', 'Tamazula de Gordiano', 'Tapalpa',
    'Tecalitlán', 'Techaluta de Montenegro', 'Tecolotlán', 'Tenamaxtlán',
    'Teocaltiche', 'Teocuitatlán de Corona', 'Tepatitlán de Morelos',
    'Tequila', 'Teuchitlán', 'Tizapán el Alto', 'Tlajomulco de Zúñiga',
    'Tlaquepaque', 'Tolimán', 'Tomatlán', 'Tonalá', 'Tonaya', 'Tonila',
    'Totatiche', 'Tototlán', 'Tuxcacuesco', 'Tuxcueca', 'Tuxpan',
    'Unión de San Antonio', 'Unión de Tula', 'Valle de Guadalupe',
    'Valle de Juárez', 'Villa Corona', 'Villa Guerrero', 'Villa Hidalgo',
    'Villa Purificación', 'Yahualica de González Gallo', 'Zacoalco de Torres',
    'Zapopan', 'Zapotiltic', 'Zapotlanejo'
  ];

  constructor() {
    this.cargarRepartidores();
  }

  inicializarRepartidorNuevo(): Repartidor {
    return {
      nombre: '',
      apellidos: '',
      email: '',
      codigoPais: '+52',
      telefono: '',
      municipio: '',
      contrasenaProvisional: '',
      fechaNacimiento: new Date(),
      activo: true
    };
  }

  async cargarRepartidores() {
    try {
      this.isLoading = true;
      this.repartidoresDisponibles = await this.repartidoresService.cargarRepartidoresDesdeBD();
      this.repartidoresFiltrados = [...this.repartidoresDisponibles];
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Validación de email
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Validación de teléfono
  validarTelefono(telefono: string): boolean {
    const regex = /^[0-9]{10}$/;
    return regex.test(telefono);
  }

  // Validación de código de país según estándar ITU-T E.164
  validarCodigoPais(codigoPais: string): boolean {
    // El estándar E.164 especifica que el código de país debe:
    // - Comenzar con el símbolo +
    // - Seguido de 1 a 3 dígitos
    const regex = /^\+\d{1,3}$/;
    return regex.test(codigoPais);
  }

  // Validación de edad
  calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  // Validación completa de repartidor
  validarRepartidor(repartidor: Repartidor): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!repartidor.nombre || repartidor.nombre.trim() === '') {
      errores.push('El nombre es obligatorio');
    }
    if (!repartidor.apellidos || repartidor.apellidos.trim() === '') {
      errores.push('Los apellidos son obligatorios');
    }
    if (!repartidor.email || repartidor.email.trim() === '') {
      errores.push('El email es obligatorio');
    } else if (!this.validarEmail(repartidor.email)) {
      errores.push('El email no tiene un formato válido');
    }

    // Validar código de país según estándar ITU-T E.164
    if (!repartidor.codigoPais || repartidor.codigoPais.trim() === '') {
      errores.push('El código de país es obligatorio');
    } else if (!this.validarCodigoPais(repartidor.codigoPais)) {
      errores.push('El código de país debe cumplir el formato E.164 (ej. +52, +1, +34)');
    }

    if (!repartidor.telefono || repartidor.telefono.trim() === '') {
      errores.push('El teléfono es obligatorio');
    } else if (!this.validarTelefono(repartidor.telefono)) {
      errores.push('El teléfono debe tener 10 dígitos');
    }
    if (!repartidor.municipio || repartidor.municipio.trim() === '') {
      errores.push('El municipio es obligatorio');
    }
    if (!repartidor.contrasenaProvisional || repartidor.contrasenaProvisional.trim() === '') {
      errores.push('La contraseña provisional es obligatoria');
    } else {
      // Validar requisitos de seguridad de la contraseña
      const contrasena = repartidor.contrasenaProvisional;

      if (contrasena.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres');
      }

      if (!/[A-Z]/.test(contrasena)) {
        errores.push('La contraseña debe contener al menos una letra mayúscula');
      }

      if (!/[0-9]/.test(contrasena)) {
        errores.push('La contraseña debe contener al menos un número');
      }

      if (!/[!@#$%&*\-_+=?]/.test(contrasena)) {
        errores.push('La contraseña debe contener al menos un símbolo (!@#$%&*-_+=?)');
      }
    }


    if (repartidor.nombre && repartidor.nombre.length > this.MAX_NOMBRE) {
      errores.push(`El nombre debe tener máximo ${this.MAX_NOMBRE} caracteres`);
    }
    if (repartidor.apellidos && repartidor.apellidos.length > this.MAX_APELLIDOS) {
      errores.push(`Los apellidos deben tener máximo ${this.MAX_APELLIDOS} caracteres`);
    }
    if (repartidor.email && repartidor.email.length > this.MAX_EMAIL) {
      errores.push(`El email debe tener máximo ${this.MAX_EMAIL} caracteres`);
    }

    const edad = this.calcularEdad(repartidor.fechaNacimiento);
    if (edad < this.MIN_EDAD) {
      errores.push(`El repartidor debe tener al menos ${this.MIN_EDAD} años`);
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  buscarPorNombre() {
    this.mensajeSinResultados = false;

    if (!this.busquedaNombre || this.busquedaNombre.trim() === '') {
      this.limpiarBusqueda();
      return;
    }

    const nombreBuscado = this.busquedaNombre.trim().toLowerCase();
    const repartidoresEncontrados = this.repartidoresDisponibles.filter(
      r => r.nombre.toLowerCase().includes(nombreBuscado) ||
        r.apellidos.toLowerCase().includes(nombreBuscado) ||
        r.email.toLowerCase().includes(nombreBuscado)
    );

    if (repartidoresEncontrados.length > 0) {
      this.repartidoresFiltrados = repartidoresEncontrados;
      this.busquedaActiva = true;
      this.mensajeSinResultados = false;
    } else {
      this.repartidoresFiltrados = [];
      this.busquedaActiva = true;
      this.mensajeSinResultados = true;
    }
  }

  limpiarBusqueda() {
    this.busquedaNombre = '';
    this.busquedaActiva = false;
    this.mensajeSinResultados = false;
    this.repartidoresFiltrados = [...this.repartidoresDisponibles];
  }

  editarRepartidor(repartidor: Repartidor) {
    this.repartidorEditando = { ...repartidor };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.repartidorEditando = null;
  }

  async guardarCambios() {
    if (this.repartidorEditando) {
      const validacion = this.validarRepartidor(this.repartidorEditando);

      if (!validacion.valido) {
        alert('Errores de validación:\n\n' + validacion.errores.join('\n'));
        return;
      }

      try {
        if (!this.repartidorEditando.id) {
          alert('Error: ID del repartidor no válido');
          return;
        }

        await this.repartidoresService.editarRepartidor(this.repartidorEditando.id, this.repartidorEditando);

        await this.cargarRepartidores();

        if (this.busquedaActiva) {
          this.buscarPorNombre();
        }

        this.cerrarModalEditar();
        alert('Repartidor actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar repartidor:', error);
        alert('Error al actualizar el repartidor en la base de datos');
      }
    }
  }

  abrirModalCrear() {
    this.repartidorNuevo = this.inicializarRepartidorNuevo();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.repartidorNuevo = this.inicializarRepartidorNuevo();
  }

  async crearRepartidor() {
    const validacion = this.validarRepartidor(this.repartidorNuevo);

    if (!validacion.valido) {
      alert('Errores de validación:\n\n' + validacion.errores.join('\n'));
      return;
    }

    try {
      await this.repartidoresService.agregarRepartidor(this.repartidorNuevo);

      await this.cargarRepartidores();

      if (this.busquedaActiva) {
        this.buscarPorNombre();
      }

      this.cerrarModalCrear();
      alert('Repartidor creado correctamente');
    } catch (error) {
      console.error('Error al crear repartidor:', error);
      alert('Error al crear el repartidor en la base de datos');
    }
  }

  async eliminarRepartidor(id: number | undefined, index: number) {
    if (!id) {
      alert('Error: ID del repartidor no válido');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este repartidor?')) {
      try {
        await this.repartidoresService.eliminarRepartidor(id);

        await this.cargarRepartidores();

        if (this.busquedaActiva) {
          this.buscarPorNombre();
        }

        alert('Repartidor eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar repartidor:', error);
        alert('Error al eliminar el repartidor de la base de datos');
      }
    }
  }

  /**
   * Genera una contraseña segura que cumple con los requisitos:
   * - Mínimo 8 caracteres
   * - Al menos 1 mayúscula
   * - Al menos 1 número
   * - Al menos 1 símbolo
   */
  generarContrasenaAleatoria(): string {
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const simbolos = '!@#$%&*-_+=?';

    // Asegurar que tenga al menos uno de cada tipo requerido
    let contrasena = '';

    // 1. Agregar una mayúscula aleatoria
    contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));

    // 2. Agregar un número aleatorio
    contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));

    // 3. Agregar un símbolo aleatorio
    contrasena += simbolos.charAt(Math.floor(Math.random() * simbolos.length));

    // 4. Completar hasta 12 caracteres con caracteres aleatorios de todos los tipos
    const todosCaracteres = mayusculas + minusculas + numeros + simbolos;
    const longitudRestante = 12 - contrasena.length; // Total de 12 caracteres

    for (let i = 0; i < longitudRestante; i++) {
      contrasena += todosCaracteres.charAt(Math.floor(Math.random() * todosCaracteres.length));
    }

    // 5. Mezclar los caracteres para que no sean predecibles
    contrasena = this.mezclarString(contrasena);

    return contrasena;
  }

  /**
   * Mezcla aleatoriamente los caracteres de un string
   */
  private mezclarString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }


  generarContrasenaParaNuevo() {
    this.repartidorNuevo.contrasenaProvisional = this.generarContrasenaAleatoria();
  }

  generarContrasenaParaEditar() {
    if (this.repartidorEditando) {
      this.repartidorEditando.contrasenaProvisional = this.generarContrasenaAleatoria();
    }
  }
}
