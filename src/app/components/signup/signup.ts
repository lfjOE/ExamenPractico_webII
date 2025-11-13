import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  model = {
    nombre: '',
    apellidos: '',
    email: '',
    codigo_pais: '',
    telefono: '',
    password: '',
    confirmar_password: '',
    fecha_nacimiento: '',
    calle: '',
    numero_externo: '',
    numero_interno: '',
    colonia: '',
    codigo_postal: '',
    municipio: ''
  };

  loading = false;
  message = '';

  async registrar(form: NgForm) {
    if (!form.valid) {
      this.message = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{1,60}$/.test(this.model.nombre)) {
      this.message = 'El nombre solo puede contener letras (máx. 60).';
      return;
    }

    if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{1,50}$/.test(this.model.apellidos)) {
      this.message = 'Los apellidos solo pueden contener letras (máx. 50).';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.model.email)) {
      this.message = 'El correo electrónico no tiene un formato válido.';
      return;
    }

    if (!/^\+\d{1,3}$/.test(this.model.codigo_pais)) {
      this.message = 'El código de país debe cumplir el formato E.164 (ej. +52).';
      return;
    }

    if (!/^\d{10}$/.test(this.model.telefono)) {
      this.message = 'El número de teléfono debe tener 10 dígitos.';
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(this.model.password)) {
      this.message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.';
      return;
    }

    if (this.model.password !== this.model.confirmar_password) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    const nacimiento = new Date(this.model.fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (edad < 18 || (edad === 18 && hoy < new Date(nacimiento.setFullYear(hoy.getFullYear())))) {
      this.message = 'Debes tener al menos 18 años.';
      return;
    }

    if (!/^[\w\s.,#-]{1,30}$/.test(this.model.calle)) {
      this.message = 'La calle solo puede contener letras, números y ., - # (máx. 30).';
      return;
    }

    if (!/^[\w\s.,#-]{1,10}$/.test(this.model.numero_externo)) {
      this.message = 'El número externo solo puede contener hasta 10 caracteres válidos.';
      return;
    }

    if (this.model.numero_interno && !/^[\w\s.,#-]{1,10}$/.test(this.model.numero_interno)) {
      this.message = 'El número interno no cumple con el formato válido.';
      return;
    }

    if (!/^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\s]{1,50}$/.test(this.model.colonia)) {
      this.message = 'La colonia solo puede contener letras y números (máx. 50).';
      return;
    }

    if (!/^\d{5}$/.test(this.model.codigo_postal)) {
      this.message = 'El código postal debe tener 5 números.';
      return;
    }

    const municipiosJalisco = [
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

    if (!municipiosJalisco.includes(this.model.municipio)) {
      this.message = 'El municipio debe pertenecer a Jalisco.';
      return;
    }

    this.loading = true;
    this.message = '';
    try {
      const res = await fetch('http://localhost:4000/api/usuarios/registrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.model)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error en el registro');
      this.message = 'Cuenta creada correctamente';
      form.resetForm();
    } catch (e: any) {
      this.message = e?.message || 'Error de conexión';
    } finally {
      this.loading = false;
    }
  }
}
