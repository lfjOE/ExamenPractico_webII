import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  model = { username: '', email: '', lastname: '', password: '', birthdate: '' };
  loading = false;
  message = '';

  async registrar() {
    this.loading = true;
    this.message = '';
    try {
      const res = await fetch('/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.model)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      this.message = 'Cuenta creada correctamente';
      this.model = { username: '', email: '', lastname: '', password: '', birthdate: '' };
    } catch (e: any) {
      this.message = e?.message || 'Error';
    } finally {
      this.loading = false;
    }
  }
}
