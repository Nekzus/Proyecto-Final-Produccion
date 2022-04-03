//**IMPORTACION SELECTORES */
import {
  totalAmount,
  productContainer,
  slidersContainer,
  totalQuantity,
  cartContainer,
  historyContainer,
  personalInformation,
  modalCheckout,
} from "../modules/selectors.js";
//**IMPORTACION FUNCIONES */
import {
  borrarItem,
  montoTotalProductos,
  indicadorCantidad,
  mensajeCarroVacio,
  productCart,
  cambiarCantidad,
  marcarFecha,
  darFormatoMoneda,
  mensajeMisCompras,
} from "../modules/functions.js";
//**IMPORTACION FUNCION AUTENTICACION */
import { auth } from "../modules/crud-firestore.js";

//**MÓDULO RENDERIZADO DE PRODUCTOS */
export const renderizarProductos = (data) => {
  productContainer.innerHTML = "";
  data.forEach((item) => {
    const { id, titulo, precio, portada, plataforma, stock } = item; // Se obtienen los datos del producto.
    const formattedPrice = darFormatoMoneda(precio, 0); // Se formatea el precio.
    productContainer.innerHTML += `<div class="col-12 col-md-4 mb-3 mt-3 mr-3 ml-3 text-center">
        <div class="card">
            <span class="cabecera-plataforma" id="plataforma-${id}"></span>
            <img src="${portada}" class="card-img-top" alt="...">
            <div class="card-body">
                <h4 class="card-title">${titulo}</h4>
                <p class="stock-disponible" id="stock-${id}"></p>
                <p class="card-text h4">${formattedPrice}</p>
            </div>
            <div class="card-footer">
                <button id="${id}" class="btn btn-agregar btn-secondary">
                Agregar al carrito
                </button>
            </div>
        </div>
    </div>`;

    //**MÓDULO RENDERIZADO DE PLATAFORMAS */
    const headerPlatform = document.querySelector(
      `span.cabecera-plataforma[id='plataforma-${item.id}']`
    ); // Se selecciona el elemento cabecera de la plataforma.
    headerPlatform.innerHTML = "";
    switch (item.plataforma) {
      case "XBOX ONE":
        headerPlatform.innerHTML += `<div class="card-header bg-success h5">
            <i class="bi bi-xbox"></i> ${plataforma}
            </div>`;
        break;
      case "PS4":
        headerPlatform.innerHTML += `<div class="card-header bg-primary h5">
            <i class="bi bi-playstation"></i> ${plataforma}
            </div>`;
        break;
      default:
        headerPlatform.innerHTML += `<div class="card-header bg-secondary h5">
            <i class="bi bi-windows"></i> ${plataforma}
            </div>`;
        break;
    }

    //**MÓDULO RENDERIZADO DE STOCK */
    const availableStock = document.querySelector(
      `p.stock-disponible[id='stock-${id}']`
    ); // Se selecciona el elemento stock.
    if (stock <= 0) {
      let button = document.getElementById(item.id);
      button.disabled = true; // Se deshabilita el boton de agregar al carrito.
      button.innerHTML = "Producto sin stock"; // Se cambia el texto del boton.
      availableStock.innerHTML = ""; // Se limpia el contenedor de stock.
      availableStock.innerHTML =
        '<span class="badge stock-item badge-sin-stock rounded-pill">SIN STOCK</span>'; // Se cambia el color del badge.
    } else if (stock > 1 && stock <= 10) {
      availableStock.innerHTML = ""; // Se limpia el contenedor de stock.
      availableStock.innerHTML = `<span class="badge stock-item badge-poco-stock rounded-pill">ÚLTIMAS ${stock} UNIDADES</span>`; // Se cambia el color del badge.
    } else if (stock === 1) {
      availableStock.innerHTML = ""; // Se limpia el contenedor de stock.
      availableStock.innerHTML = `<span class="badge stock-item badge-poco-stock rounded-pill">ÚLTIMA UNIDAD</span>`; // Se cambia el color del badge.
    } else if (stock > 10) {
      availableStock.innerHTML = ""; // Se limpia el contenedor de stock.
      availableStock.innerHTML = `<span class="badge stock-item badge-en-stock rounded-pill">STOCK DISPONIBLE</span>`; // Se cambia el color del badge.
    } else {
      return;
    }
  });
};

//**MÓDULO RENDERIZADO IMAGENES DEL SLIDER */
export const renderizarSliders = (data) => {
  data.forEach((item) => {
    const { slider, titulo, descripcion, rating, lanzamiento } = item; // Se obtienen los datos de la imagen.
    slidersContainer.innerHTML += `<div class="carousel-item">
    <img src="${slider}" class="imagen-slider d-block w-100" title="${titulo}">
    <div class="carousel-caption d-none d-md-block">
    <div class="fondo-slider">
        <div class="texto-slider"><h1 class="titulo-slider">${titulo}</h1>
        <p class="descripcion-slider">${descripcion}</p>
        <p class="descripcion-slider">Fecha de lanzamiento: ${lanzamiento}</p>
        <p class="descripcion-slider">Rating:<span class="stars"> <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-half"></i></span> ${rating}</p>
        </div>
        </div>
    </div>
</div>`;
  });
};

//**MÓDULO RENDERIZADO CARRITO */
export const renderizarCarrito = () => {
  cartContainer.innerHTML = ""; // Se limpia el contenido del DOM.
  totalAmount.innerHTML = ""; // Se limpia el contenido del DOM.
  totalQuantity.innerHTML = ""; // Se limpia el contenido del DOM.
  productCart.forEach((item) => {
    const { id, titulo, portada, precio, stock, cantidad } = item; // Se obtienen los datos del product.
    const formattedPrice = darFormatoMoneda(precio, 0); // Se formatea el precio.
    const priceForQuantity = darFormatoMoneda(precio * cantidad, 0); // Se calcula el precio por cantidad.
    cartContainer.innerHTML += `
        <tr><th scope="row"><img src=${portada} width="80rem"></th>
        <td>${titulo}</td>
        <td class="precio-cantidad">${formattedPrice}</td>
        <td>
        <div class="selector-cantidad d-flex col-auto">
        <span class="cantidad-item">
        <button class="btn-cantidad btn-restar btn btn-secondary" id="${id}" type="button">-</button>
        </span>
        <input type="text" id="item-cant-${id}" class="form-control form-cant p-1" value="${cantidad}" min="1" max="${stock}/>
        <span class="cantidad-item">
        <button class="btn-cantidad btn-sumar btn btn-secondary" id="${id}" type="button">+</button>
        </span>
        </div>
        </td>
        <td class="precio-cantidad">${priceForQuantity}</td>
        <td><button id="${id}" type="button" class="btn-borrar btn btn-default"><i class="bi bi-trash"></i></button></td></tr>`; // Se agrega botón para eliminar item. Se agrega el id del item para su posterior borrado.
  });
  borrarItem();
  totalAmount.innerHTML = `${montoTotalProductos()}`; // Se muestra el monto total de los productos en el DOM.

  indicadorCantidad(); // Se muestra el indicador de cantidad de productos en el DOM.

  mensajeCarroVacio(); // Se muestra el mensaje de carro vacío.

  cambiarCantidad(); // Se ejecuta la función para cambiar la cantidad de productos.
};

//**MODULO RENDERIZADO MIS COMPRAS */
export const renderizarHistorial = (data) => {
  historyContainer.innerHTML = ``; // Se limpia el contenido del DOM.
  data.forEach((item) => {
    const idTransaction = item.id; // Se obtiene el id de la transacción.
    const product = item.datos; // Se obtiene los productos de la transacción.
    const metaData = product.pop();
    let { email, date, username, total, shipping } = metaData; // Se extrae el email, fecha y nombre de usuario del último elemento del array.
    const hoy = marcarFecha(); // Se obtiene la fecha actual.
    date === hoy ? (date = "Hoy") : (date = date); // Se compara la fecha de la transacción con la fecha actual.
    auth.onAuthStateChanged((user) => {
      // Se verifica si el usuario está logueado.
      if (user !== null) {
        if (user.email === email) {
          // Se verifica si el email del usuario es igual al email de la transacción.
          const container = document.createElement("div"); // Se crea un contenedor.
          container.className = "row mis-compras"; // Se le asigna una clase.
          container.innerHTML = ""; // Se limpia el contenido del contenedor.
          container.innerHTML = `<h4 class="encabezado-mis-compras p-1">Identificador: ${idTransaction} - Fecha: ${date} - Monto: ${total}</h4>`; // Se agrega el encabezado.
          product.forEach((product) => {
            // Se recorre el array de productos.
            mensajeMisCompras(product); // Se muestra el mensaje de mis compras.
            const { portada, titulo, plataforma, precio, cantidad } = product; // Se obtienen los datos del product.
            const formattedPrice = darFormatoMoneda(precio, 0); // Se formatea el precio.
            container.innerHTML += `<div class="col-auto col-md-4 mb-2 mt-2 mr-2 ml-2 text-center">
                        <div class="card">
                        <div class="card-header bg-black h5">
                        <i class="bi bi-calendar"></i> ${date}
                        </div>
                        <div class="row g-0">
                        <div class="col-md-4">
                        <img src="${portada}" class="img-fluid" alt="${titulo}">
                        </div>
                        <div class="col-md-8">
                        <div class="card-body">
                        <p class="card-text envio-status">${shipping}</p>
                        <p class="card-text">Transacción: #<span>${idTransaction}</p>
                        <p class="card-text">Título: ${titulo}</p>
                        <p class="card-text">Plataforma: ${plataforma}</p>
                        <p class="card-text">Precio: ${formattedPrice}</p>
                        <p class="card-text">Cantidad: ${cantidad} ud.</p>
                        <p class="card-text"><small class="text-muted">Usuario: ${username} - E-mail: ${email}</small></p>
                        </div>
                        </div>
                        </div>
                        </div>`;

            historyContainer.appendChild(container); // Se agrega el contenedor al DOM.
          });
        }
      }
    });
  });
};

//**MODULO RENDERIZADO DATOS PERSONALES */
export const renderizarDatosPersonales = (data) => {
  // Se renderiza los datos personales del usuario.
  const { address, city, email, lastname, name, state, zip } = data;
  personalInformation.innerHTML = ``;
  personalInformation.innerHTML = `<h4 class="titulo-datos">Tus datos</h4>
        <fieldset disabled>
        <form class="row g-3">
        <div class="col-md-6">
          <input type="text" class="form-control" id="inputName41" placeholder="Nombre: ${name}">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" id="inputLastName41"placeholder="Apellido: ${lastname}">
        </div>
        <div class="col-md-12">
          <input type="email" class="form-control" id="inputEmail41" placeholder="E-mail: ${email}">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" id="inputAddress4" placeholder="Domicilio: ${address}">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" id="inputCity4" placeholder="Localidad: ${city}">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" id="inputState4" placeholder="Provincia: ${state}">
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" id="inputZip4" placeholder="C.P: ${zip}">
        </div>
        <!-- <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="gridCheck4">
            <label class="form-check-label" for="gridCheck">
              Check me out
            </label>
          </div>
        </div> -->
        </form>

        </div>
        </div>
        </fieldset>`;
};

//**MODULO RENDERIZADO DATOS DE PAGO */
export const renderizarModalCheckout = (data) => {
  // Se renderiza el modal de checkout.
  const { address, state, city, zip, total, lastname, name } = data;
  modalCheckout.innerHTML = ``;
  modalCheckout.innerHTML = `<div class="products">
    <h3 class="title">Costo productos</h3>
    <div class="total-precio">TOTAL A PAGAR ${total}</div>
  </div>
  <div class="shipping-details">
    <h3 class="title">Detalles de envio</h3>
    <div class="envio-checkout">ENVIO GRATIS<span class="envio"></span></div>
    <h5 class="title">Destinatario</h5>
    <div class="envio-datos">Nombre y Apellido: ${name} ${lastname}</div>
    <div class="envio-datos">Domicilio: ${address}</div>
    <div class="envio-datos">Ciudad: ${city}</div>
    <div class="envio-datos">Provincia: ${state}</div>
    <div class="envio-datos">Código Postal: ${zip}</div>
    </div>
  </div>`;
};
