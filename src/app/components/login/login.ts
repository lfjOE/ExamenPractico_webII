import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { UiStateService } from '../../ui-state.service';
import { Router } from '@angular/router';

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

  constructor(private auth: AuthService, private ui: UiStateService, private router: Router) { }

  async ingresar() {
    this.loading = true;
    this.message = '';
    this.user = null;
    try {
      const res = await fetch('http://localhost:4000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.model)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');

      const { user_id, username, email, tipo } = data;
      this.auth.login({ user_id, username, email, tipo });
      console.log('Usuario logueado: ', data);

      this.message = 'Inicio de sesión exitoso';

      if (tipo === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (e: any) {
      this.message = e?.message || 'Error';
    } finally {
      this.loading = false;
    }
  }

}
