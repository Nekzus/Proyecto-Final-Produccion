
document.addEventListener("DOMContentLoaded", () => {
    habilitarSolapas();
    leerProductosDB('games');
    leerHistorialDB('transaccion');
    leerDatosUsuarioDB('usuarios');
});

import { leerProductosDB, leerHistorialDB, leerDatosUsuarioDB , habilitarSolapas } from '../modules/functions.js';



