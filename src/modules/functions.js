//**IMPORTACION RENDERS */
import { renderizarProductos, renderizarSliders, renderizarCarrito, renderizarHistorial, renderizarDatosPersonales, renderizarModalCheckout } from '../modules/renders.js';
//**IMPORTACION SELECTORES */
import {
    btnEmptyCart,
    totalQuantity,
    userName,
    userProfile,
    noticeLogin,
    usernameSignup,
    emailSignUp,
    passwordSignup,
    visibleLogin,
    visibleLogout,
    firstnameSignup,
    lastnameSignup,
    addressSignup,
    citySignup,
    stateSignup,
    zipSignup,
    signupForm,
    checkoutCart,
    signinForm,
    emailLogin,
    passwordLogin,
    logout,
    modifyForm,
    addressModify,
    cityModify,
    stateModify,
    zipModify,
    modalCheckout,
    btnConfirm,
    btnCancel,
    preloader,
} from '../modules/selectors.js';
//**IMPORTACION FUNCIONES FIRESTORE */
import { db, guardarObjetosDB, guardarDatosDB, actualizarDatosDB, auth } from '../modules/crud-firestore.js';

export let productCart = JSON.parse(localStorage.getItem('productCart')) || []; // Array que almacena los items ingresados por el usuario a modo de objetos. Se realiza lectura del array almacenado en localStorage.
export let date = 0; // variable fecha actual.
export let metadataUser = {}; // variable metadatos carrito.
export let dataUser = {}; // variable que almacena los datos del usuario, que seran ingresados a la variable de metadatos.
export const apiKey = process.env.APIKEY;
export const authDomain = process.env.AUTHDOMAIN;
export const projectId = process.env.PROJECTID;

//**LEER PRODUCTOS DB CLOUD FIREBASE*/
export const leerProductosDB = async(collection) => {
    await db.collection(collection).onSnapshot((onSnapshot) => { // Se lee la coleccion de la base de datos.
        const data = onSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        habilitarSolapas();
        renderizarProductos(data);
        renderizarSliders(data);
        renderizarCarrito();
        detectarBotones(data);
        vaciarCarrito();
    })
};

//**LEER HISTORIAL DB CLOUD FIREBASE*/
export const leerHistorialDB = async(collection) => {
    await db.collection(collection).onSnapshot((onSnapshot) => { // Se lee la coleccion de la base de datos.
        const data = onSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        renderizarHistorial(data);
    })
};

//**LEER DATOS DE USUARIO DB CLOUD FIREBASE*/
export const leerDatosUsuarioDB = async(collection) => {
    await db.collection(collection).onSnapshot((onSnapshot) => { // Se lee la coleccion de la base de datos.
        const data = onSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        if (auth.currentUser) {
            const personalInformation = data.find(user => user.email === auth.currentUser.email);
            renderizarDatosPersonales(personalInformation);
            return dataUser = personalInformation;
        }
    })
};

//**FUNCIÓN BORRADO INDIVIDUAL DE ITEM */
export const borrarItem = () => {
    const btnDeleteItem = document.querySelectorAll('.btn-borrar'); // Se seleccionan todos los botones de borrado sobre la el carrito.
    btnDeleteItem.forEach(btn => { // Se recorren y se escucha si alguno fue pulsado
        btn.addEventListener('click', (e) => { // Se escucha el evento click sobre el boton.
            e.stopPropagation(); // Se detiene la propagacion del evento.
            let deleteItem = parseInt(btn.id); // Se reconoce el boton pulsado por su numero de id. Coincidente con el código de producto.
            const btnAdd = document.querySelector(`.btn-agregar[id="${deleteItem}"]`); // Se selecciona el boton de agregar con el mismo código de producto.
            activarDesactivarBtn(btnAdd, true); // Se activa el boton de agregar al quitar el producto del carrito.
            productCart = JSON.parse(localStorage.getItem('productCart')); // Se lee el array almacenado en el localStorage.
            const indexDeleteItem = productCart.findIndex(item => item.id === deleteItem);
            productCart.splice(indexDeleteItem, 1); // Se ejecuta el borrado.           
            localStorage.setItem('productCart', JSON.stringify(productCart)); // Se almacena el array con el item borrado. 
            renderizarCarrito(); // Se recarga la pagina.   
        })
    })
};

//**FUNCIÓN MONTO TOTAL PRODUCTOS EN CARRITO */
export const montoTotalProductos = () => {
    let total = 0;
    if (productCart.length != 0) {
        productCart.forEach(item => {
            total += item.precio * item.cantidad; //  Se suman los montos en cada iteracion en el carrito.
        })
        total = darFormatoMoneda(total, 0);
        return total; // Se retorna el total con formato de moneda.
    };
};

//**FUNCIÓN INDICA EN UN BADGE LA CANTIDAD TOTAL DE PRODUCTOS EN EL CARRITO */
export const indicadorCantidad = () => {
    if (productCart.length != 0) {
        totalQuantity.innerHTML = `<span class="badge rounded-pill">${productCart.length}</span>`;
    } else {
        totalQuantity.innerHTML = '';
    }
};

//**FUNCIÓN MOSTRAR ALERTA CUANDO EL CARRO ESTA VACIO Y OCULTAR BOTONES DE COMPRA Y BORRADO */
export const mensajeCarroVacio = () => {
    if (productCart.length === 0) { // Se muestra un alerta si el carrito esta vacio.
        $('#carro-vacio').fadeIn(300);
        $('#encabezado-carrito').hide();
        $('.monto-total').hide();
        $('.btn-carrito').hide();
    } else {
        $('#carro-vacio').hide(); // Se oculta el alerta si el carrito no esta vacio.
        $('#encabezado-carrito').show();
        $('.monto-total').show();
        $('.btn-carrito').show();
    }
};

//**FUNCIÓN MOSTRAR ALERTA CUANDO NO HAY HISTORIAL DE COMPRAS */
export const mensajeMisCompras = (product) => {
    if (product.length === 0) { // Se muestra un alerta si el historial esta vacio.
        $('#mis-compras-vacio').fadeIn(300);
    } else {
        $('#mis-compras-vacio').hide();
    }
};

//**FUNCION QUE DETECTA SI FUE PULSADO ALGUN BOTON DE AGREGAR PRODUCTO */
export const detectarBotones = (data) => {
    const buttons = document.querySelectorAll('.card button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            activarDesactivarBtn(btn, false);
            const product = data.find(item => item.id === parseInt(btn.id));

            if (productCart.length === 0 || product.cantidad === undefined) { // Se agrega el producto al carrito.

                product.cantidad = 1;
            }
            ingresoCarrito(product); // Se ingresa el producto al carrito.

        })
    })
};

//**FUNCIÓN DE INGRESO PRODUCTO SELECCIONADO AL CARRITO */
export const ingresoCarrito = (item) => {
    let products;
    const itemExistsInCart = productCart.some(product => product.id === item.id); // Revisar si el item ya fue agregado al carrito.
    if (itemExistsInCart) {
        products = productCart.map(product => { // Se recorre el array de productos para actualizar la cantidad.
            if (product.id === item.id) {
                if (product.stock > 0) {
                    product.cantidad++;
                }
                return product; // Devuelve el item duplicado
            } else {
                return product; // Devuelve le item sin duplicación.
            }
        });
        productCart = [...products]; // Se actualiza el array de productos.
    } else {
        if (item.stock > 0) {
            item.cantidad = 1;
            productCart = [...productCart, item]; // Se agrega el item al array de carrito.
        }
    }
    localStorage.setItem('productCart', JSON.stringify(productCart)); // Se almacena en el localStorage el nuevo objeto-item creado.
    renderizarCarrito(); // Se refresca el navegador para que se muestren los cambios.
};

//**FUNCION PARA ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO */
export const vaciarCarrito = () => {
    btnEmptyCart.addEventListener("click", () => {
        if (productCart.length != 0) {
            productCart = []; // Se eliminan todos los items del carrito.
            localStorage.setItem('productCart', JSON.stringify(productCart)); // Se almacena en el localStorage el nuevo objeto-item creado.
            renderizarCarrito(); // Se recarga la pagina.
            const btnAdd = document.querySelectorAll(`.btn-agregar`);
            btnAdd.forEach(btn => {
                if (btn.textContent !== 'Producto sin stock') {
                    activarDesactivarBtn(btn, true); // Se activan los botones de agregar.
                }
            })
            return;
        }
    })
};

//** FUNCION PARA INCREMENTAR O DECREMENTAR LA CANTIDAD DE ITEMS MEDIANTE BOTONES */
export const cambiarCantidad = () => {
    const btnQuantity = document.querySelectorAll('.btn-cantidad');
    btnQuantity.forEach(btn => { // Se recorren y se escucha si alguno fue pulsado
        btn.addEventListener('click', (e) => { // Se escucha el evento click sobre el boton.
            e.stopPropagation(); // Se detiene la propagacion del evento.
            let itemChange = parseInt(btn.id); // Se reconoce el boton pulsado por su numero de id. Coincidente con el código de producto.
            if (e.target.classList.contains('btn-sumar')) { // Se verifica si el boton fue pulsado para incrementar o decrementar.
                productCart = JSON.parse(localStorage.getItem('productCart')); // Se lee el array almacenado en el localStorage.
                const product = productCart.find(item => item.id === itemChange);

                if (product.cantidad < 10 && product.stock - product.cantidad > 0) { // Se verifica que la cantidad no supere el limite.
                    product.cantidad++; // Se incrementa la cantidad del producto.
                    localStorage.setItem('productCart', JSON.stringify(productCart)); // Se almacena el array con el item borrado.
                    renderizarCarrito(); // Se verifica si el boton fue pulsado para incrementar o decrementar.
                } else { btn.disabled = true };

            } else if (e.target.classList.contains('btn-restar')) {
                const product = productCart.find(item => item.id === itemChange);
                if (product.cantidad > 1) {
                    product.cantidad--; // Se incrementa la cantidad del producto.
                    localStorage.setItem('productCart', JSON.stringify(productCart)); // Se almacena el array con el item borrado.
                    renderizarCarrito(); // Se verifica si el boton fue pulsado para incrementar o decrementar.
                } else { btn.disabled = true };
            }
        })
    })
};

//**FUNCION MOSTRAR/OCULTAR ICONOS AL LOGUEARSE*/
const mostrarIconos = (user) => {
    if (user) {
        visibleLogin.forEach((icon) => (icon.style.display = "block"));
        visibleLogout.forEach((icon) => (icon.style.display = "none"));
    } else {
        visibleLogin.forEach((icon) => (icon.style.display = "none"));
        visibleLogout.forEach((icon => (icon.style.display = "block")));
    }
};

//**FUNCION DE HABILITACION SOLAPAS PANTALLA INICIO */
export const habilitarSolapas = () => {
    $('#pills-signin-tab').on('click', function(e) {
        e.preventDefault()
        $(this).tab('show')
    })

    $('#pills-signup-tab').on('click', function(e) {
        e.preventDefault()
        $(this).tab('show')
    })

    $('#pills-logout-tab').on('click', function(e) {
        e.preventDefault()
        $(this).tab('show')
    })

    $('#pills-login-tab').on('click', function(e) {
        e.preventDefault()
        $(this).tab('show')
    })
    $('#pills-historial-tab').on('click', function(e) {
        e.preventDefault()
        $(this).tab('show')
    })

    $('#pills-carrito-tab').on('click', function(e) {
        e.preventDefault()
        $(this).tab('show')
    })
};

//**CHECKOUT CARRITO */
checkoutCart.addEventListener('click', (e) => {
    e.preventDefault();
    const userLogged = (Object.entries(metadataUser).length != 0);
    if (userLogged) {
        const totalAmount = montoTotalProductos();
        const personalInformation = dataUser;
        const { address, city, state, zip, name, lastname } = personalInformation;
        metadataUser.total = totalAmount;
        metadataUser.address = address;
        metadataUser.city = city;
        metadataUser.state = state;
        metadataUser.zip = zip;
        metadataUser.name = name;
        metadataUser.lastname = lastname;
        metadataUser.shipping = 'ENVIO EN PREPARACIÓN';
        renderizarModalCheckout(metadataUser); // Se ejecuta la función para renderizar el modal de checkout.
        mostrarOcultarModal('#checkout-modal', 'show'); // Se muestra el modal de checkout.
        btnConfirm.style.display = "block";
        btnCancel.style.display = "block";
        btnConfirm.addEventListener('click', (e) => {
            e.stopPropagation()
            if (productCart.length !== 0) {
                productCart = [...productCart, metadataUser]; // Se agrega metadatos al array de carrito.
                guardarDatosDB(productCart, 'transaccion');
                productCart.forEach(item => {
                    if (item.id !== undefined) {
                        const id = (item.id).toString();
                        const stock = (item.stock - item.cantidad);
                        actualizarDatosDB('games', id, stock)
                    };
                    productCart = [];
                    localStorage.setItem('productCart', JSON.stringify(productCart)); // Se almacena en el localStorage el nuevo objeto-item creado.
                    renderizarCarrito(); // Se recarga la pagina.
                })
                modalCheckout.innerHTML = ``; // Se limpia el modal de checkout.
                modalCheckout.innerHTML = `
        <h3 class="title"><i class="bi bi-check-circle"></i> Gracias por tu compra</h3>
        <p>La operación fue realizada con éxito. Pronto recibiras noticias sobre tu envió.</p>
        <p>Consulta datos de envio y operación en el menu Mis Compras.</p>
        `;
                btnConfirm.style.display = "none";
                btnCancel.style.display = "none";
            }
        });
    } else {
        mostrarOcultarModal('#signin-modal', 'show');
        noticeLogin.innerHTML = 'Para comprar debes estar logueado. Inicia sesión.';
    }
});

//**AUTENTICACION DE USUARIOS FIREBASE: REGISTRO DE NUEVO USUARIO */
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameSignup.value;
    const email = emailSignUp.value;
    const password = passwordSignup.value;
    const name = firstnameSignup.value;
    const lastname = lastnameSignup.value;
    const address = addressSignup.value;
    const city = citySignup.value;
    const state = stateSignup.value;
    const zip = zipSignup.value;

    const user = new Object(); // Se crea un objeto para almacenar los datos del usuario.
    user.username = username;
    user.email = email;
    user.name = name;
    user.lastname = lastname;
    user.address = address;
    user.city = city;
    user.state = state;
    user.zip = zip;

    auth
        .createUserWithEmailAndPassword(email, password) // Se crea el usuario con el email y contraseña.
        .then(userCredential => {
            guardarObjetosDB(user, 'usuarios'); // Se almacena el usuario en la base de datos.
            // Se limpia el formulario.
            signupForm.reset();
            mostrarOcultarModal('#signup-modal', 'hide'); // Se cierra el modal de registro.
            signupForm.querySelector('.error').innerHTML = 'Registro correcto.'; // Se limpia el mensaje de error.
            signupForm.querySelector('.error').innerHTML = ''; // Se limpia el mensaje de error.
        }).catch(error => {
            console.log(error.code);
            if (error.code == 'auth/invalid-email') {
                signupForm.querySelector('.error').innerHTML = 'El formato del e-mail no es válido.';
            } else if (error.code == 'auth/weak-password') {
                signupForm.querySelector('.error').innerHTML = 'La contraseña tiene menos de 6 caracteres.';
            } else if (error.code == 'auth/email-already-in-use') {
                signupForm.querySelector('.error').innerHTML = 'El e-mail ya está en uso.';
            } else if (error.code == 'auth/operation-not-allowed') {
                signupForm.querySelector('.error').innerHTML = 'No se puede registrar el usuario.';
            } else {
                signupForm.querySelector('.error').innerHTML = 'Error desconocido.';
            }
        })
});

//**AUTENTICACION DE USUARIOS FIREBASE: LOGIN DE USUARIO */
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailLogin.value;
    const password = passwordLogin.value;
    auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Se limpia el formulario.
            signinForm.reset();
            mostrarOcultarModal('#signin-modal', 'hide');
            // console.log('sign in')
            signinForm.querySelector('.error').innerHTML = '';
        }).catch(error => {
            if (error.code == 'auth/invalid-email') {
                signinForm.querySelector('.error').innerHTML = 'El formato del e-mail no es válido.';
            } else if (error.code == 'auth/user-not-found') {
                signinForm.querySelector('.error').innerHTML = 'El usuario no existe.';
            } else if (error.code == 'auth/wrong-password') {
                signinForm.querySelector('.error').innerHTML = 'La contraseña es incorrecta.';
            } else {
                signinForm.querySelector('.error').innerHTML = 'Error desconocido.';
            }
        })
});

//**AUTENTICACION DE USUARIOS FIREBASE: LOGOUT DE USUARIO */
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        metadataUser = {}; // Se limpia el objeto datosUsuario.
        // console.log('sign out')
    });

});

//**LISTA DE EVENTOS USUARIO REGISTRADO */
auth.onAuthStateChanged(user => {

    if (user) {
        leerDatosUsuarioDB('usuarios');
        leerHistorialDB('transaccion');
        mostrarIconos(user);
        buscarUsuario(user.email, 'usuarios');

    } else {
        userName.innerHTML = '';
        mostrarIconos(user);
    }

});

//**OBTENER NOMBRE DE USUARIO REGISTRADO */
const buscarUsuario = async(email, collection) => {
    await db.collection(collection).onSnapshot((onSnapshot) => {
        const data = onSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const userDB = data.find(user => user.email === email);
        userName.innerHTML = ` ${userDB.username}`;
        userProfile.innerHTML = ` ${userDB.username}`;
        const user = userDB.username;
        const mail = userDB.email;
        marcarFecha();
        metadataUser = crearObjetoDatos(user, mail, date);
    })
};

//**FUNCION PARA CREAR OBJETO CON DATOS DE USUARIO */
const crearObjetoDatos = (username, email, date) => {
    const user = new Object(); // Se crea un objeto para almacenar los datos del usuario.
    user.username = username;
    user.email = email;
    user.date = date;
    return user;
};

//**FUNCION ACTIVACION/DESACTIVACION BOTONES AGREGAR CARRITO */
export const activarDesactivarBtn = (btn, activate) => {
    if (activate) {
        btn.disabled = false;
        btn.innerHTML = 'Agregar al carrito';
    } else {
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-cart-plus-fill"></i> Agregado al carrito';
    }
};

//**FORMATO FECHA REGISTRO */
export const marcarFecha = () => {
    date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    date = dd + '/' + mm + '/' + yyyy;
    return date;
};

//**DAR FORMATO DE MONEDA A LOS MONTOS */
export const darFormatoMoneda = (value, tenths) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: tenths,
    }).format(value);
};

//**MODULO MODIFICACION DOMICILIO USUARIO */
modifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = dataUser.id;
    const address = addressModify.value;
    const city = cityModify.value;
    const state = stateModify.value;
    const zip = zipModify.value;
    if (address === '' || city === '' || state === '' || zip === '') {
        modifyForm.querySelector('.error').innerHTML = 'Debe completar todos los campos.';
    } else {
        db.collection('usuarios').doc(id).update({
            address: address,
            city: city,
            state: state,
            zip: zip
        }).then(() => {
            modifyForm.reset();
            modifyForm.querySelector('.error').innerHTML = '';
            mostrarOcultarModal('#modify-modal', 'hide')
        })
    }
});
//**FUNCION PARA MOSTRAR/OCULTAR VENTANA MODAL*/
const mostrarOcultarModal = (modal, status) => {
    $(modal).modal(status);
};