//**CONFIGURACION ACCESO BASE DE DATOS CLOUD FIRESTORE *
firebase.initializeApp({
    apiKey: YOUR_APIKEY,
    authDomain: YOUR_AUTHDOMAIN,
    projectId: YOUR_PROJECTID,
});

export const db = firebase.firestore();
export const auth = firebase.auth();

//**AGREGAR DATO A LA BASE DE DATOS */
export const guardarDatosDB = (datos, coleccion) => {

    db.collection(coleccion).add({
            datos
        })
        .then((docRef) => {
            // console.log("Transacción guardada con exito bajo ID: ", docRef.id);
            return docRef;
        })
        .catch((error) => {
            console.error("Error al guardar documento: ", error);
        })
};

//**AGREGAR UN OBJETO A LA BASE DE DATOS */
export const guardarObjetosDB = (datos, coleccion) => {
    db.collection(coleccion).add(datos)
        .then((docRef) => {
            console.log("Documento guardado con exito bajo ID: ", docRef.id);
        })
        .catch(err => {
            console.log("Error al guardar documento: ", err);
        })
};

//**LEER DATOS EN LA BASE DE DATOS */
export const leerDatosDB = async(coleccion) => {
    await db.collection(coleccion).onSnapshot((onSnapshot) => {
        const data = onSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        return data;
    })
};

//**BORRAR DATOS EN LA BASE DE DATOS */
export const borrarDatosDB = (id, coleccion) => {
    db.collection(coleccion).doc(id).delete().then(function() {
        console.log("Documento borrado con exito!");
    }).catch(function(error) {
        console.error("Error borrando documento: ", error);
    });
};

//**ACTUALIZAR DATOS EN LA BASE DE DATOS */
export const actualizarDatosDB = (coleccion, id, dato) => {
    const updateRef = db.collection(coleccion).doc(id);

    return updateRef.update({
            stock: dato,
        })
        .then(function() {
            // console.log("Stock actualizado con exito!");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error actualizando documento: ", error);
        });
};