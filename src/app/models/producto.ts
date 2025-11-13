export interface Producto {
    id_producto?: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen?: string;
}

export interface ProductoConCantidad extends Producto {
    cantidad: number;
}