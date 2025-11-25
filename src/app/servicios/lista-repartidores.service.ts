import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListaRepartidoresService {
  repartidores = signal<Repartidor[]>([]);

  /**
   * Cargar todos los repartidores desde la base de datos
   */
  async cargarRepartidoresDesdeBD(): Promise<Repartidor[]> {
    try {
      const response = await fetch('http://localhost:4000/api/repartidores/listar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const repartidores = await response.json();
      this.repartidores.set(repartidores as Repartidor[]);
      return repartidores as Repartidor[];
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
      throw error;
    }
  }

  /**
   * Agregar un nuevo repartidor a la base de datos
   */
  async agregarRepartidor(repartidor: Repartidor): Promise<any> {
    try {
      const response = await fetch('http://localhost:4000/api/repartidores/agregar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repartidor)
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const resultado = await response.json();

      // Actualizar la lista local de repartidores
      await this.cargarRepartidoresDesdeBD();

      return resultado;
    } catch (error) {
      console.error('Error al agregar repartidor:', error);
      throw error;
    }
  }

  /**
   * Editar un repartidor existente en la base de datos
   */
  async editarRepartidor(id: number, repartidor: Partial<Repartidor>): Promise<any> {
    try {
      const response = await fetch('http://localhost:4000/api/repartidores/editar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          ...repartidor
        })
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const resultado = await response.json();

      // Actualizar la lista local de repartidores
      await this.cargarRepartidoresDesdeBD();

      return resultado;
    } catch (error) {
      console.error('Error al editar repartidor:', error);
      throw error;
    }
  }

  /**
   * Eliminar un repartidor de la base de datos
   */
  async eliminarRepartidor(id: number): Promise<any> {
    try {
      const response = await fetch('http://localhost:4000/api/repartidores/eliminar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const resultado = await response.json();

      // Actualizar la lista local de repartidores
      await this.cargarRepartidoresDesdeBD();

      return resultado;
    } catch (error) {
      console.error('Error al eliminar repartidor:', error);
      throw error;
    }
  }
}
