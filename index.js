//9 1 Iniciar las librerias

const express = require("express");
const app = express();

//9 3 Definimos los middlewares

app.use(express.urlencoded({extended:false}));
app.use(express.json());

//9 4 definimos una ruta de entrada

app.get("/",(req,res) => {
    res.send("Hello World");
});

//9 2 Creamos el servidor o el puerto de escucha

app.listen(4000, ()=>{
    console.log('Servidor escuchando en puerto http://localhost:4000');
});