import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  forgotForm: FormGroup;
  loading = false;
  message = '';
  isError = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.message = '';

      const email = this.forgotForm.get('email')?.value;

      this.http.get(`http://localhost:4000/api/usuarios/recover-password?email=${email}`)
        .subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this.message = 'Si el email existe, recibirás un enlace de recuperación en tu correo.';
              this.isError = false;

              // Redirigir después de éxito
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            } else {
              this.message = response.message || 'Error al enviar el email';
              this.isError = true;
            }
          },
          error: (error) => {
            this.loading = false;
            this.message = 'Error de conexión. Intenta nuevamente.';
            this.isError = true;
            console.log('Error:', error);
          }
        });
    }
  }
}