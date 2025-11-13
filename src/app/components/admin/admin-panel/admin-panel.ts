import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  imports: [],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel {
  constructor(private router: Router) { }

  irA(seccion: string) {
    this.router.navigate([`/${seccion}`]);
  }
}
