import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  model = { usernameOrEmail: '', password: '' };
  loading = false;
  message = '';
  user: any = null;

  async ingresar() {
    this.loading = true;
    this.message = '';
    this.user = null;
    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.model)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      this.user = data;
      this.message = 'Inicio de sesión exitoso';
    } catch (e: any) {
      this.message = e?.message || 'Error';
    } finally {
      this.loading = false;
    }
  }
}
