// Carrito productos
const productosCarrito = document.getElementById('productosCarrito')

// Declaro botones.
const btnVerCarrito = document.getElementById('verCarrito')
const btnPagar = document.getElementById('pagarBtn')
const agregarACarritoBtn = document.getElementById('agregarACarritoBtn')
const restarCantidadBtn = document.getElementById('restarCantidad')
const sumarCantidadBtn = document.getElementById('sumarCantidad')

// Modal
const modalCarrito = document.getElementById('modalCarrito')
const modalCarritoBS = new bootstrap.Modal(modalCarrito)
const modalComprarProducto = document.getElementById('comprarProducto')
const modalComprarProductoBS = new bootstrap.Modal(modalComprarProducto)

// Modal
let contadorCarrito = document.querySelector("#contadorCarrito")

let carrito = [];
let categorias = [];

let productoSeleccionado = null;

function verCarrito(carrito) {
    if (carrito.length === 0) {
        crearNotificacion('error', 'Su carrito se encuentra vacio.')
        return;
    }
    let totalTicket = 0;
    let carritoLista = ""
    for (const [indice,orden] of carrito.entries()) {
        carritoLista += `<div class="d-flex align-items-center gap-1">
                            <button class="btn btn-outline-primary text-dark fs-6 p-1" onclick="borrarOrden(${indice})"><i class="fa-solid fa-trash-can"></i></button>
                            <p class="m-0">Cantidad: ${orden.items} ~ ${orden.producto.nombre} ~ $${orden.producto.precio}</p>
                        </div>`;
        totalTicket += orden.obtenerTotal();
    }
    const totalCarrito = document.getElementById('totalCarrito')
    productosCarrito.innerHTML = carritoLista;
    totalCarrito.innerText = totalTicket;
    modalCarritoBS.show();
}

function borrarOrden(ordenId) {
    console.log(carrito[ordenId])
    carrito.splice(ordenId, 1)
    contadorCarrito.innerHTML = carrito.length;
    sessionStorage.setItem('Carrito', JSON.stringify(carrito));
    if (carrito.length > 0){
        verCarrito(carrito)
    } else {
        modalCarritoBS.hide();
    }
}

function mostrarProducto(botonSelecionado) {
    let { productoId, categoriaId } = botonSelecionado.dataset;
    let categoriaSeleccionada = categorias.find(categoria => categoria.id == categoriaId)
    productoSeleccionado = categoriaSeleccionada.obtenerProducto(productoId);
    let productoDetalle = `
    <img src="${productoSeleccionado.imagen}" id="modalProductoImagen"
         class="card-img-top border-bottom border-dark" alt="${productoSeleccionado.nombre}"/>
    <p class="fs-3" id="modalProductoTitulo">${productoSeleccionado.nombre}</p>
    <p id="modalProductoDesc">${productoSeleccionado.descripcion}</p>
    `;
    let precioProducto = document.querySelector("#modalProductoPrecio");
    precioProducto.innerHTML = productoSeleccionado.precio;
    let modalBody = document.querySelector('#modalBody');
    modalBody.innerHTML = productoDetalle;
}

function agregarProductoACarrito() {
    if (!productoSeleccionado) {
        crearNotificacion('error', 'No se pudo generar la orden para el producto selecionado.')
        return;
    }
    const inputCantidad = document.getElementById('inputCantidad')
    let cantidadSeleccionada = parseInt(inputCantidad.value)
    let ordenExistente = carrito.find(orden => orden.producto === productoSeleccionado)
    if (ordenExistente){
        ordenExistente.modificarCantidad(cantidadSeleccionada + ordenExistente.items)
    } else {
        let nuevaOrden = new Orden(productoSeleccionado, cantidadSeleccionada);
        carrito.push(nuevaOrden);
    }
    inputCantidad.value = 1;
    sessionStorage.setItem('Carrito', JSON.stringify(carrito));
    btnVerCarrito.disabled = false;
    modalComprarProductoBS.hide();
    contadorCarrito.innerHTML = carrito.length
    crearNotificacion('success', 'El producto fue agregado al carrito exitosamente.')
}

function cargarTienda() {
    cargarCategorias();
    let carritoExistente = JSON.parse(sessionStorage.getItem('Carrito')) ?? [];
    for (let order of carritoExistente){
        let ordenExistente = new Orden(order.producto, order.items);
        carrito.push(ordenExistente);
    }
    contadorCarrito.innerHTML = carrito.length
}

function cargarCategorias() {
    let tiendaOnline = document.querySelector('#tiendaOnline')
    tiendaOnline.innerHTML = '';
    obtenerJson("datos/categorias.json")
        .then((categoriasJson) => {
            categoriasJson.forEach((categoria) => {
                let div = document.createElement('div');
                let template = `
            <div class="row m-3 border-bottom border-danger border-2">
                <div class="col-6 mt-3">
                    <h3>${categoria.nombre}</h3>
                </div>
            </div>
            <div class="row m-4 gy-3" id="productos-${categoria.id}"></div>`
                div.innerHTML = template;
                tiendaOnline.append(div);
                categorias.push(new Categoria(categoria.id, categoria.nombre))
            })
            cargarProductos();
        })
}

function cargarProductos() {
    obtenerJson("datos/productos.json")
        .then((productos) => {
            for (let producto of productos) {
                let nuevoProducto = new Producto(producto.id, producto.nombre, producto.precio, producto.imagen);
                categorias.find(categoria => categoria.id == producto.categoria).agregarProducto(nuevoProducto);
                let categoriaHtml = document.querySelector(`#productos-${producto.categoria}`)
                let div = document.createElement('div');
                div.classList.add('col-12', 'col-sm-6', 'col-md-3', 'd-flex', 'justify-content-center')
                div.innerHTML = `
                <div id="c1-p1" class="card shadow" style="width: 18rem">
                    <img src="${producto.imagen}"
                         class="card-img-top border-bottom border-dark" alt="Rack TV con escritorio"/>
                    <div class="card-body">
                        <p class="card-title text-center fs-5">${producto.nombre}</p>
                        <p class="card-text text-center">$${
                    producto.precio}</p>
                        <a href="#" class="btn btn-primary d-flex justify-content-center seleccionarProducto"
                           data-bs-toggle="modal"
                           data-producto-id="${producto.id}"
                           data-categoria-id="${producto.categoria}"
                           data-bs-target="#comprarProducto">Mirar
                            producto</a>
                    </div>
                </div>`
                categoriaHtml.append(div)
            }
        })
}

function obtenerJson(url) {
    return fetch(url)
        .then((respuesta) => respuesta.json())
        .catch(err => {
            crearNotificacion("error", "Ocurrio un error cargando los productos");
            return [];
        })
}

function actualizarCantidad(valor){
    const inputCantidad = document.getElementById('inputCantidad')
    let valorActual = parseInt(inputCantidad.value);
    if (valorActual === 1 && valor == -1){
        return;
    }
    inputCantidad.value = valorActual + valor
}

function crearNotificacion(tipo, mensaje) {
    Toastify({
        text: mensaje,
        className: tipo
    }).showToast();
}

(function () {
    // Eventos de bootstrap.
    modalComprarProducto.addEventListener('show.bs.modal', (event) => mostrarProducto(event.relatedTarget))
    modalComprarProducto.addEventListener('hide.bs.modal', () => {
        productoSeleccionado = null
    })

    //agrego eventos.
    agregarACarritoBtn.addEventListener('click', agregarProductoACarrito);
    btnVerCarrito.addEventListener('click', () => verCarrito(carrito));
    btnPagar.addEventListener('click', () => {
        // Si pago el carrito, debo limpiarlo. (Y deshabilitar el boton nuevamente)
        crearNotificacion("success", "Su carrito ha sido pagado.");
        carrito = []
        sessionStorage.removeItem('Carrito');
        contadorCarrito.innerHTML = 0
        modalCarritoBS.hide();
    });
    restarCantidadBtn.addEventListener('click', () => actualizarCantidad(-1));
    sumarCantidadBtn.addEventListener('click',() => actualizarCantidad(1));

    cargarTienda();
})();