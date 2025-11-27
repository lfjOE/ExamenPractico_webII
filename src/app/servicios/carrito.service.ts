import { Injectable, signal } from '@angular/core';
import { ProductoConCantidad } from '../models/producto';

export interface Recibo {
    id: string;
    fecha: Date;
    productos: ProductoConCantidad[];
    total: number;
    subtotal: number;
    iva: number;
}

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    productos = signal<ProductoConCantidad[]>([]);
    productosDisponibles = signal<ProductoConCantidad[]>([]);

    async cargarProductosDesdeBD(): Promise<ProductoConCantidad[]> {
        const response = await fetch('http://localhost:4000/api/inventario/inventario');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const productos = await response.json();
        this.productosDisponibles.set(productos as ProductoConCantidad[]);
        return productos as ProductoConCantidad[];
    }

    agregar(producto: ProductoConCantidad): boolean {
        // Validar que hay stock disponible
        if (!producto.cantidad || producto.cantidad <= 0) {
            alert('Este producto no tiene stock disponible');
            return false;
        }

        // Buscar si el producto ya existe en el carrito
        const productoEnCarrito = this.productos().find(p => p.id_producto === producto.id_producto);

        if (productoEnCarrito) {
            // Producto ya existe, intentar aumentar cantidad
            const stockDisponible = this.obtenerStockDisponible(producto.id_producto!);
            const cantidadEnCarrito = productoEnCarrito.cantidad || 0;

            if (cantidadEnCarrito >= stockDisponible) {
                alert(`No hay más stock disponible. Stock: ${stockDisponible}, en carrito: ${cantidadEnCarrito}`);
                return false;
            }

            // Incrementar cantidad
            this.productos.update(products =>
                products.map(p =>
                    p.id_producto === producto.id_producto
                        ? { ...p, cantidad: (p.cantidad || 0) + 1 }
                        : p
                )
            );
        } else {
            // Producto nuevo, agregar con cantidad 1
            this.productos.update(products => [...products, { ...producto, cantidad: 1 }]);
        }

        return true;
    }

    aumentarCantidad(id_producto: number): boolean {
        const stockDisponible = this.obtenerStockDisponible(id_producto);
        const productoEnCarrito = this.productos().find(p => p.id_producto === id_producto);

        if (!productoEnCarrito) return false;

        const cantidadActual = productoEnCarrito.cantidad || 0;

        if (cantidadActual >= stockDisponible) {
            alert(`No hay más stock disponible. Stock: ${stockDisponible}`);
            return false;
        }

        this.productos.update(products =>
            products.map(p =>
                p.id_producto === id_producto
                    ? { ...p, cantidad: (p.cantidad || 0) + 1 }
                    : p
            )
        );

        return true;
    }

    disminuirCantidad(id_producto: number): void {
        const productoEnCarrito = this.productos().find(p => p.id_producto === id_producto);

        if (!productoEnCarrito) return;

        const cantidadActual = productoEnCarrito.cantidad || 0;

        if (cantidadActual <= 1) {
            // Si la cantidad es 1, eliminar el producto
            this.quitar(id_producto);
        } else {
            // Disminuir cantidad
            this.productos.update(products =>
                products.map(p =>
                    p.id_producto === id_producto
                        ? { ...p, cantidad: (p.cantidad || 0) - 1 }
                        : p
                )
            );
        }
    }

    private obtenerStockDisponible(id_producto: number): number {
        const productoDisponible = this.productosDisponibles().find(p => p.id_producto === id_producto);
        return productoDisponible?.cantidad || 0;
    }

    quitar(id: number) {
        this.productos.update(products => products.filter(p => p.id_producto !== id));
    }

    vaciar() {
        this.productos.set([]);
    }

    total() {
        return this.productos().reduce((sum, product) => sum + (product.precio * (product.cantidad || 1)), 0);
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
        return `${Date.now()}`;
    }

    generarXML(recibo: Recibo): string {
        const fechaEmision = recibo.fecha.toISOString();
        const rfcEmisor = 'XAXX010101000';
        const rfcReceptor = 'XAXX010101000';
        const lugarExpedicion = '00000';

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"
    Version="4.0"
    Serie="A"
    Folio="${recibo.id}"
    Fecha="${fechaEmision}"
    FormaPago="03"
    CondicionesDePago="CONTADO"
    SubTotal="${recibo.subtotal.toFixed(2)}"
    Moneda="MXN"
    TipoCambio="1"
    Total="${recibo.total.toFixed(2)}"
    TipoDeComprobante="I"
    Exportacion="01"
    MetodoPago="PUE"
    LugarExpedicion="${lugarExpedicion}">
    
    <cfdi:Emisor 
        Rfc="${rfcEmisor}" 
        Nombre="MaterialHub" 
        RegimenFiscal="601"/>
    
    <cfdi:Receptor 
        Rfc="${rfcReceptor}" 
        Nombre="PUBLICO EN GENERAL" 
        DomicilioFiscalReceptor="${lugarExpedicion}"
        RegimenFiscalReceptor="616"
        UsoCFDI="S01"/>
    
    <cfdi:Conceptos>
        ${recibo.productos.map((producto) => {
            const importe = (producto.precio * (producto.cantidad || 1));
            const valorUnitario = producto.precio;
            return `
        <cfdi:Concepto 
            ClaveProdServ="01010101" 
            NoIdentificacion="${producto.id_producto}" 
            Cantidad="${producto.cantidad || 1}" 
            ClaveUnidad="H87" 
            Unidad="Pieza"
            Descripcion="${this.escapeXML(producto.nombre)} - ${this.escapeXML(producto.descripcion)}" 
            ValorUnitario="${valorUnitario.toFixed(2)}" 
            Importe="${importe.toFixed(2)}"
            Descuento="0.00"
            ObjetoImp="02">
            <cfdi:Impuestos>
                <cfdi:Traslados>
                    <cfdi:Traslado 
                        Base="${importe.toFixed(2)}" 
                        Impuesto="002" 
                        TipoFactor="Tasa" 
                        TasaOCuota="0.160000" 
                        Importe="${(importe * 0.16).toFixed(2)}"/>
                </cfdi:Traslados>
            </cfdi:Impuestos>
        </cfdi:Concepto>`;
        }).join('')}
    </cfdi:Conceptos>
    
    <cfdi:Impuestos 
        TotalImpuestosTrasladados="${recibo.iva.toFixed(2)}">
        <cfdi:Traslados>
            <cfdi:Traslado 
                Base="${recibo.subtotal.toFixed(2)}"
                Impuesto="002" 
                TipoFactor="Tasa" 
                TasaOCuota="0.160000" 
                Importe="${recibo.iva.toFixed(2)}"/>
        </cfdi:Traslados>
    </cfdi:Impuestos>
    
    <!-- NOTA: Este CFDI NO está timbrado. Para uso fiscal real se requiere:
         1. Certificado de Sello Digital (CSD) del SAT
         2. Timbrado por un PAC (Proveedor Autorizado de Certificación)
         3. UUID y sello digital válidos -->
    
</cfdi:Comprobante>`;

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