class Producto {
    constructor(id, nombre, precio, imagen) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.imagen = imagen;
        this.descripcion = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur sequi impedit esse
        asperiores numquam commodi obcaecati animi expedita cum totam, doloribus, ullam aliquid
        error, reprehenderit quos tenetur eligendi nihil quisquam!`;
    }
} 

class Categoria {
    productos = [];
    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre
    }
    agregarProducto(productoAAgregar){
        this.productos.push(productoAAgregar);
    }
    obtenerProducto(productoId){
        return this.productos.find(producto => producto.id == productoId)
    }
    eliminarProducto(productoAEliminar){
        this.productos = this.productos.filter(producto => producto !== productoAEliminar)
    }
}

class Orden {
    items = 0;
    constructor(producto) {
        this.producto = producto;
        this.items = 1;
    }

    modificarCantidad(nuevaCantidad){
        this.items = nuevaCantidad;
    }

    obtenerTotal(){
        return this.items * this.producto.precio;
    }
}