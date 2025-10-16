//9 1 Iniciar las librerias

const express = require("express");
const app = express();

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "./env/.env" });
}

// const session = require("express-session"); // solo ha nivel de desarrollo para trabajar con express-session
const session = require("cookie-session"); // para trabajar con cookie-session
const cookieParser = require("cookie-parser"); // para trabajar con cookies
const cookieSession = require("cookie-session");
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
const db = require("./database/db"); // para trabajar con la base de datos
// const Swal = require('sweetalert2');
// const expressLayouts = require("express-ejs-layouts"); // para usar layouts en ejs

//9 7 Definir o configurar la sesion

//con express-session
// app.use(
//     session({
//         secret:"secret", // clave para cifrar la sesion
//         resave: false, // se guarda en cada peticion
//         saveUninitialized: false, // se guarda en cada peticion cuando se produzcan cambios.
//     })
// )

// con cookie-session

const sessionConfig = {
    name: "session", // nombre de la cookie
    keys: ["clave secreta"], // clave para cifrar la sesion
    maxAge: 24 * 60 * 60 * 1000, // tiempo de expiracion de la cookie en milisegundos (1 dia)
};

app.use(cookieParser()); // para trabajar con cookies
app.use(cookieSession(sessionConfig)); // para trabajar con cookie-session

// Middleware global para que login y rol estén disponibles en todas las vistas EJS
app.use((req, res, next) => {
    res.locals.login = req.session.loggedin || false;
    res.locals.rol = req.session.rol || null;
    next();
});

//9 3 Definimos los middlewares
// app.use(express.urlencoded({ extended : false })); para pasar los datos planos
app.use(express.urlencoded({ extended: true })); // para pasar los datos como objetos
app.use(express.json());
app.use("/", require("./src/router")); // para pasar los datos estaticos, como css, js, imagenes, etc.

//9 5 Configurar carpeta public

app.use("/resources", express.static("public"));

//9 6 Definir el motor de vistas

app.set("view engine", "ejs");
// app.use(expressLayouts); // para usar layouts en ejs
//app.set("views", _dirname, "/viwes"); por si la carpeta views no esta en la raiz del proyecto

//9 8 compartir la sesion de socket

io.use((socket, next) => {
    const req = socket.request;
    cookieSession(sessionConfig)(req, {}, next); // Usar cookie-session para compartir la sesión con socket.io

    if (!req.session || !req.session.loggedin) {
        console.log("Acceso restringido");
        return next(new Error("Acceso restringido"));
    }

    console.log("Acceso concedido");
    next();
});

//manejador de conexiones

io.on("connection", (socket) => {
    const session = socket.request.session;
    const username = session.user;
    const rol = session.rol;

    // console.log(`Usuario conectado: ${user} con rol: ${rol}`);
    console.log("Usuario conectado: ", username, " con rol ", rol);

    // sala de usuario
    socket.join("user: ${username}"); // Unir al usuario a su sala

    if (rol === "admin") {
        socket.join("admins"); // Unir al usuario administrador a la sala de administradores
    }

    //Escuchador de eventos para mensajes

    socket.on("mensaje_privado", ({ para, mensaje }) => {
        const de = username;

        // Emitir el mensaje a todos los usuarios en la sala del usuario
        io.to(`user: ${para}`).emit("mensaje_privado", { de, mensaje });

        // muestra a los admin de que usuario viene el mensaje
        if (rol !== "admin") {
            io.to("admins").emit("mensaje_privado", { de, mensaje });
        }

        // Guardar el mensaje en la base de datos
        const sql =
            "INSERT INTO mensajes (de_usuario, para_usuario, mensaje) VALUES (?, ?, ?)";
        db.query(sql, [de, para, mensaje], (error, result) => {
            if (error) {
                console.error("Error al guardar el mensaje:", err);
            } else {
                console.log("Mensaje guardado en la base de datos");
            }
        });
    });
    //detecta desconexion

    socket.on("disconnect", () => {
        console.log("Usuario desconectado: ", username);
    });
});

//9 2 Creamos el servidor o el puerto de escucha

server.listen(4000, () => {
    console.log("Servidor escuchando en puerto http://localhost:4000");
});

app.use((req, res, next) => {
    res.locals.login = req.session.loggedin || false;
    res.locals.rol = req.session.rol || null;
    next();
});

/**
 * todo falta editar el user.
 *      falta crear el bbdd usuario cursos. */
