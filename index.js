//9 1 Iniciar las librerias

const express = require("express");
const app = express();
require("dotnet").config({path:".env/.env"});
const bcrypt = require("bcrypt.js");
const session = require("express-session"); // solo ha nivel de desarrollo

//9 7 Definir o configurar la sesion
app.use(
    session({
        secret:"secret", // clave para cifrar la sesion
        resave: false, // se guarda en cada peticion
        saveUninitialized: false, // se guarda en cada peticion cuando se produzcan cambios.
    })
)


//9 3 Definimos los middlewares

app.use(express.urlencoded({extended:false}));
app.use(express.json());

//9 5 Configurar carpeta public

app.use("/resource",express.static("public"));

//9 6 Definir el motor de vistas

app.set("view engine", "ejs");
//app.set("views", _dirname, "/viwes"); por si la carpeta views no esta en la raiz del proyecto


//9 4 definimos una ruta de entrada

app.get("/",(req,res) => {
    res.send("Hello World");
});

//9 2 Creamos el servidor o el puerto de escucha

app.listen(4000, ()=>{
    console.log('Servidor escuchando en puerto http://localhost:4000');
});