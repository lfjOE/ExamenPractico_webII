export interface Producto {
    id_producto?: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen?: string;
    vigente?: boolean;
}

export const VALIDACIONES_PRODUCTO = {
    MAX_INT: 2147483647,
    MAX_NOMBRE: 30,
    MAX_DESCRIPCION: 80,
    MIN_PRECIO: 0.01,
    MIN_CANTIDAD: 0,
};

export interface ProductoConCantidad extends Producto {
    cantidad: number;
}