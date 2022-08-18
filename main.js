// Carrito productos
const productosCarrito = document.getElementById('productosCarrito')

// Declaro botones.
const btnVerCarrito = document.getElementById('verCarrito')
const btnPagar = document.getElementById('pagarBtn')
const agregarACarritoBtn = document.getElementById('agregarACarritoBtn')

// Modal
const modalCarrito = document.getElementById('modalCarrito')
const modalCarritoBS = new bootstrap.Modal(modalCarrito)
const modalComprarProducto = document.getElementById('comprarProducto')
const modalComprarProductoBS = new bootstrap.Modal(modalComprarProducto)

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
    for (let orden of carrito) {
        carritoLista += `<p>Cantidad: ${orden.items} ~ ${orden.producto.nombre} ~ $${orden.producto.precio}</p>`;
        totalTicket += orden.producto.precio;
    }
    const totalCarrito = document.getElementById('totalCarrito')
    productosCarrito.innerHTML = carritoLista;
    totalCarrito.innerText = totalTicket;
    modalCarritoBS.show();
}


function mostrarProducto(botonSelecionado) {
    let { productoId, categoriaId } = botonSelecionado.dataset;
    console.log(productoId, categoriaId, botonSelecionado.dataset);
    let categoriaSeleccionada = categorias.find(categoria => categoria.id == categoriaId)
    productoSeleccionado = categoriaSeleccionada.obtenerProducto(productoId);
    let productoDetalle = `
    <img src="${productoSeleccionado.imagen}" id="modalProductoImagen"
         class="card-img-top border-bottom border-dark" alt="${productoSeleccionado.nombre}"/>
    <p id="modalProductoTitulo">${productoSeleccionado.nombre}</p>
    <p>Precio: $<span id="modalProductoPrecio">${productoSeleccionado.precio}</span></p>
    <p id="modalProductoDesc">${productoSeleccionado.descripcion}</p>
    `;
    let modalBody = document.querySelector('#modalBody');
    modalBody.innerHTML = productoDetalle;
}

function agregarProductoACarrito() {
    if (!productoSeleccionado) {
        crearNotificacion('error', 'No se pudo generar la orden para el producto selecionado.')
        return;
    }
    let nuevaOrden = new Orden(productoSeleccionado);
    carrito.push(nuevaOrden);
    sessionStorage.setItem('Carrito', JSON.stringify(carrito));
    btnVerCarrito.disabled = false;
    modalComprarProductoBS.hide();
    crearNotificacion('success', 'El producto fue agregado al carrito exitosamente.')
}

function cargarTienda() {
    cargarCategorias();
    carrito = JSON.parse(sessionStorage.getItem('Carrito')) ?? [];
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
                        <p class="card-text text-center">$${producto.precio}</p>
                        <a href="#" class="btn btn-primary d-flex justify-content-center seleccionarProducto"
                           data-bs-toggle="modal"
                           data-producto-id="${producto.id}"
                           data-categoria-id="${producto.categoria}"
                           data-bs-target="#comprarProducto">Mirar
                            producto</a>
                    </div>
                </div>`
                console.log(categoriaHtml);
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
        modalCarritoBS.hide();
    });
    cargarTienda();
})();