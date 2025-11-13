import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  resetForm: FormGroup;
  loading = false;
  message = '';
  isError = false;
  token: string | null = null;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;

      if (!this.token || !this.email) {
        this.message = 'Enlace inválido o expirado';
        this.isError = true;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.resetForm.valid && this.token && this.email) {
      this.loading = true;
      this.message = '';

      const { newPassword } = this.resetForm.value;

      try {
        const response = await fetch('http://localhost:4000/api/usuarios/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: this.token,
            email: this.email,
            newPassword: newPassword
          })
        });

        const data = await response.json();
        this.loading = false;

        if (data.success) {
          this.message = 'Contraseña restablecida correctamente. Redirigiendo al login...';
          this.isError = false;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.message = data.message || 'Error al restablecer la contraseña';
          this.isError = true;
        }
      } catch (error) {
        this.loading = false;
        this.message = 'Error de conexión. Intenta nuevamente.';
        this.isError = true;
        console.error('Error:', error);
      }
    }
  }

}