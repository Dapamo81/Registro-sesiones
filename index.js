//9 1 Iniciar las librerias

const express = require("express");
const app = express();
require("dotenv").config({path:"./env/.env"});
const session = require("express-session"); // solo ha nivel de desarrollo
// const Swal = require('sweetalert2');
// const expressLayouts = require("express-ejs-layouts"); // para usar layouts en ejs

//9 7 Definir o configurar la sesion 
app.use(
    session({
        secret:"secret", // clave para cifrar la sesion
        resave: false, // se guarda en cada peticion
        saveUninitialized: false, // se guarda en cada peticion cuando se produzcan cambios.
    })
)


//9 3 Definimos los middlewares
// app.use(express.urlencoded({ extended : false })); para pasar los datos planos
app.use(express.urlencoded({ extended : true })); // para pasar los datos como objetos
app.use(express.json());
app.use("/", require("./src/router")); // para pasar los datos estaticos, como css, js, imagenes, etc.

//9 5 Configurar carpeta public

app.use("/resources",express.static("public"));

//9 6 Definir el motor de vistas

app.set("view engine", "ejs");
// app.use(expressLayouts); // para usar layouts en ejs
//app.set("views", _dirname, "/viwes"); por si la carpeta views no esta en la raiz del proyecto


//9 2 Creamos el servidor o el puerto de escucha

app.listen(4000, ()=>{
    console.log('Servidor escuchando en puerto http://localhost:4000');
});