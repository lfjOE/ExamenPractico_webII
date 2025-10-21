import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto';

export interface Recibo {
    id: string;
    fecha: Date;
    productos: Producto[];
    total: number;
    subtotal: number;
    iva: number;
}

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    productos = signal<Producto[]>([]);

    async cargarProductosDesdeBD(): Promise<Producto[]> {
        const response = await fetch('http://localhost:4000/api/catalogo/productos');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        console.log(response);
        const productos = await response.json();
        return productos as Producto[];
    }


    agregar(producto: Producto) {
        this.productos.update(products => [...products, producto]);
    }

    quitar(id: number) {
        this.productos.update(products => products.filter(p => p.id_producto !== id));
    }

    vaciar() {
        this.productos.set([]);
    }

    total() {
        return this.productos().reduce((sum, product) => sum + product.precio, 0);
    }

    subtotal() {
        return this.total() / 1.16;
    }

    iva() {
        return this.total() - this.subtotal();
    }

    generarRecibo(): Recibo {
        return {
            id: this.generarIdUnico(),
            fecha: new Date(),
            productos: [...this.productos()],
            total: this.total(),
            subtotal: this.subtotal(),
            iva: this.iva()
        };
    }

    private generarIdUnico(): string {
        return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generarXML(recibo: Recibo): string {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <id>${recibo.id}</id>
  <fecha>${recibo.fecha.toISOString()}</fecha>
  <productos>
    ${recibo.productos.map(producto => `
    <producto>
      <id>${producto.id_producto}</id>
      <nombre>${this.escapeXML(producto.nombre)}</nombre>
      <precio>${producto.precio}</precio>
      <descripcion>${this.escapeXML(producto.descripcion)}</descripcion>
    </producto>`).join('')}
  </productos>
  <totales>
    <subtotal>${recibo.subtotal.toFixed(2)}</subtotal>
    <iva>${recibo.iva.toFixed(2)}</iva>
    <total>${recibo.total.toFixed(2)}</total>
  </totales>
</recibo>`;

        return xml;
    }

    private escapeXML(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    descargarXML(xml: string, filename: string): void {
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}