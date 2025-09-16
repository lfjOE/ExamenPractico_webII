// models/producto.ts
export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen?: string; // Emoji para representar el producto
}