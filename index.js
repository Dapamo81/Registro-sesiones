//9 1 Iniciar las librerias

const express = require("express");
const app = express();
require("dotenv").config({path:"./env/.env"});
const bcrypt = require("bcryptjs");
const session = require("express-session"); // solo ha nivel de desarrollo
const db = require("./database/db");

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

app.use("/resources",express.static("public"));

//9 6 Definir el motor de vistas

app.set("view engine", "ejs");
//app.set("views", _dirname, "/viwes"); por si la carpeta views no esta en la raiz del proyecto


//9 4 definimos una ruta de entrada

app.get("/",(req,res) => {
    res.render("index",{user:"Dani"});
});

app.get("/login",(req,res) => {
    res.render("login");
});

app.get("/register",(req,res) => {
    res.render("register");
});

//9 8 definimos las rutas post

app.post("/register", async(req,res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    const passwordHash = await bcrypt.hash(pass,8);
    
    db.query(
        "Insert INTO usuarios SET?",
        {
            Usuario: user,
            Nombre: name,
            rol: rol,
            pass: passwordHash,
        },
        (error,results) => {
            if(error){
                console.log(error);
            }else{
                res.render("register",{
                    alert:true,
                    alertTitle: "Register",
                    alertMessage:"El usuario se ha registrado correctamente",
                    alertIcon:"success",
                    showConfirmButton:false,
                    timer:1500,
                    ruta:"/",
                })
            }
        }
        )
})


//9 2 Creamos el servidor o el puerto de escucha

app.listen(4000, ()=>{
    console.log('Servidor escuchando en puerto http://localhost:4000');
});