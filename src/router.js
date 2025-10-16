//9 1 Iniciar las librerias

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { body, validation, validationResult } = require("express-validator");
const crud = require("./controllers"); // para usar las operaciones CRUD

//9 funciones
//verificamos sesion
function VerficarSession(req, res, next) {
    if (req.session.loggedin) {
        next(); // si la sesion esta activa, continua con la siguiente funcion
    } else {
        res.redirect("login");
    }
}

//verificar Admin

function VerificarAdmin(req, res, next) {
    //operador de encadenamiento opcional (?.) para evitar errores si req.session es undefined
    if (req.session?.loggedin && req.session?.rol === "admin") {
        next(); // si la sesion esta activa y el rol es admin, continua con la siguiente funcion
    } else {
        res.redirect("/login");
    }
}

//9 4 definimos una ruta de entrada (para enviar las vistas)

router.get("/", (req, res) => {
    if (req.session.loggedin) {
        res.render("index", {
            user: req.session.name,
            login: true,
            titulo: "Home",
        });
    } else {
        res.render("index", {
            user: "Debe iniciar sessión",
            login: false,
            titulo: "Home",
        });
    }
    // res.render("index",{user:"Dani"});
});

router.get("/login", (req, res) => {
    if (req.session.loggedin) {
        res.render("login", {
            login: true,
        });
    } else {
        res.render("login", {
            login: false,
        });
    }
});

router.get("/register", (req, res) => {
    if (req.session.loggedin) {
        res.render("register", {
            login: true,
        });
    } else {
        res.render("register", {
            login: false,
        });
    }
});

router.get("/admin", (req, res) => {
    // res.render("admin");
    if (req.session.loggedin) {
        db.query("SELECT * FROM usuarios", (error, results) => {
            if (error) {
                throw error;
            } else {
                // console.log(results);
                res.render("admin", {
                    usuarios: results,
                    login: true,
                    rol: req.session.rol,
                });
            }
        });
    } else {
        res.render("admin", {
            msg: "Acceso restringido, por favor iniciar sessión",
            login: false,
        });
    }
    // res.render("index",{user:"Dani"});
});

router.get("/create", (req, res) => {
    res.render("create", {
        login: true,
        titulo: "Crear Curso",
    });
});
router.get("/createUser", (req, res) => {
    res.render("createUser", {
        login: true,
        titulo: "Crear Usuario",
    });
});

router.get("/cursos", (req, res) => {
    if (req.session.loggedin) {
        db.query("SELECT * FROM cursos", (error, results) => {
            if (error) {
                throw error;
            } else {
                // console.log(results);
                res.render("cursos", {
                    cursos: results,
                    login: true,
                    rol: req.session.rol,
                });
            }
        });
    } else {
        db.query("SELECT * FROM cursos", (error, results) => {
            if (error) {
                throw error;
            } else {
                // console.log(results);
                res.render("cursos", {
                    cursos: results,
                    msg: "Acceso limitado, por favor iniciar sessión",
                    login: false,
                    rol: req.session.rol,
                });
            }
        });
    }
});

router.get("/editCursos/:ref", (req, res) => {
    const ref = req.params.ref;
    console.log(ref);
    db.query(
        "SELECT * FROM cursos WHERE referencia= ?",
        [ref],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                res.render("editCursos", {
                    curso: results[0],
                    login: req.session.loggedin,
                    rol: req.session.rol,
                });
            }
        }
    );
});

router.get("/editUser/:ref", (req, res) => {
    const ref = req.params.ref;
    console.log(ref);
    db.query("SELECT * FROM usuarios WHERE id= ?", [ref], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.render("editUser", {
                usuario: results[0],
                login: req.session.loggedin,
                rol: req.session.rol,
            });
        }
    });
});

//Creamos la ruta de delete para cursos
router.get("/delete/:ref", (req, res) => {
    const ref = req.params.ref;
    db.query(
        "DELETE FROM cursos WHERE referencia = ?",
        [ref],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                res.redirect("/cursos");
            }
        }
    );
});

//Creamos ruta de soporte
router.get("/soporte", VerficarSession, (req, res) => {
    res.render("soporte", {
        user: {
            username: req.session.user || req.session.name,
            rol: req.session.rol,
        },
    });
});

// Api que optiene el historial

router.get("/api/mensajes", VerificarAdmin, (req, res) => {
    // const usuario = req.session.con; // usuario conectado
    const usuario = req.query.con;

    if (!usuario) {
        return res
            .status(401)
            .json({ error: "Falta el parámetro del usuario" });
    }

    const sql =
        "SELECT de_usuario, para_usuario, mensaje, fecha  FROM mensajes WHERE (de_usuario = ? OR para_usuario = ?) ORDER BY fecha ASC";
    db.query(sql, [usuario, usuario], (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error del servidor" });
            // throw error;
            console.error("Error al obtener los mensajes:", error);
        } else {
            res.json(results);
        }
    });
});

//Api mostrar mensajes propios
router.get("/api/mensajes/mios", VerficarSession, (req, res) => {
    const usuario = req.session.user; // usuario conectado

    if (!req.session?.loggedin || !usuario) {
        return res.status(401).json({ error: "Necesitas estar logeado" });
    }

    const sql =
        "SELECT de_usuario, para_usuario, mensaje FROM mensajes WHERE (de_usuario = ? OR para_usuario = ?) ORDER BY fecha ASC";
    db.query(sql, [usuario, usuario], (error, results) => {
        if (error) {
            console.log("Error al obtener los mensajes:", error);
            throw error;
        } else {
            res.json(results);
        }
    });
});

//Api usuarios que han escrito mensajes
router.get("/api/usuarios-conversaciones", VerificarAdmin, (req, res) => {
    const sql =
        "SELECT DISTINCT usuario FROM ( SELECT de_usuario AS usuario FROM mensajes WHERE para_usuario IN (SELECT usuario FROM usuarios WHERE rol = 'admin') UNION SELECT para_usuario AS usuario FROM mensajes WHERE de_usuario IN (SELECT usuario FROM usuarios WHERE rol = 'admin') ) AS conversaciones WHERE usuario NOT IN (SELECT usuario FROM usuarios WHERE rol = 'admin')";

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Error al obtener los usuarios:", error);
            throw error;
        } else {
            const usuarios = results.map((row) => row.usuario);
            res.json(usuarios);
        }
    });
});
//Creamos la ruta de deleteUser
router.get("/deleteUser/:ref", (req, res) => {
    const ref = req.params.ref;
    db.query("DELETE FROM usuarios WHERE id = ?", [ref], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.redirect("/admin");
        }
    });
});

//9 8 definimos las rutas de post
//  definimos las rutas insert

router.post(
    "/register",
    [
        body("user")
            .isLength({ min: 4 })
            .withMessage("El usuario debe tener 4 caracteres"),
        body("name")
            .isLength({ min: 4 })
            .withMessage("El nombre debe tener 4 caracteres"),
        body("pass")
            .isLength({ min: 4 })
            .withMessage("El pass debe tener 4 caracteres"),
        body("email").isEmail().withMessage("El email no es válido"),
    ],
    async (req, res) => {
        console.log("Request body:", req.body);
        const errors = validationResult(req);
        console.log("Validation errors:", errors.array());
        if (!errors.isEmpty()) {
            console.log(req.body);
            const valores = req.body;
            const validacionErrores = errors.array();
            return res.render("register", {
                validaciones: validacionErrores,
                valores: valores,
                titulo: "Registro",
            });
        } else {
            const { user, name, pass, email } = req.body;
            const passwordHash = await bcrypt.hash(pass, 8);

            db.query(
                "INSERT INTO usuarios SET ?",
                {
                    Usuario: user,
                    Nombre: name,
                    rol: "user",
                    pass: passwordHash,
                    email: email,
                },
                (error, results) => {
                    if (error) {
                        console.error(error);
                        // Opcional: enviar respuesta de error
                        return res.render("register", {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage:
                                "Hubo un problema al registrar el usuario.",
                            alertIcon: "error",
                            titulo: "Registro",
                        });
                    } else {
                        res.render("register", {
                            alert: true,
                            alertTitle: "Register",
                            alertMessage:
                                "El usuario se ha registrado correctamente",
                            alertIcon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: "/",
                            titulo: "Resgistro",
                        });
                    }
                }
            );
        }
    }
);

// definimos la ruta de login
router.post("/auth", async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    if (user && pass) {
        db.query(
            "SELECT * FROM usuarios WHERE usuario = ?",
            [user],
            async (error, results) => {
                if (
                    results.length == 0 ||
                    !(await bcrypt.compare(pass, results[0].pass))
                ) {
                    // res.send(
                    //      "El usuario no existe o la contraseña es incorrecta"
                    // );
                    return res.render("login", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage:
                            "El usuario no existe o la contraseña es incorrecta",
                        alertIcon: "error",
                        showConfirmButton: true,
                        timer: false,
                        ruta: "login",
                        login: false,
                        titulo: "Login",
                    });
                } else {
                    req.session.loggedin = true;
                    req.session.name = results[0].nombre;
                    req.session.user = results[0].usuario;
                    req.session.rol = results[0].rol;
                    // res.send("El usuario se ha logeado correctamente");

                    res.render("login", {
                        alert: true,
                        alertTitle: "Login",
                        alertMessage: "El usuario se ha logeado correctamente",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 2500,
                        ruta: "",
                        login: true,
                        titulo: "Login",
                    });
                }
            }
        );
    } else {
        res.render("login", {
            alert: true,
            alertTitle: "Login",
            alertMessage: "Introduzca su usuario y contraseña",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 2500,
            ruta: "",
            login: false,
            titulo: "Login",
        });
    }
});

// definimos la ruta de saveUsers

router.post("/editUser/:ref", (req, res) => {
    const nuevaContrasena = req.body.nuevaContrasena; // desde el formulario
    if (!nuevaContrasena || nuevaContrasena.length < 8) {
        return res.status(400).send("La contraseña es demasiado corta.");
    }

    // Generar hash
    const bcrypt = require("bcrypt");
    const saltRounds = 10;

    bcrypt.hash(nuevaContrasena, saltRounds, (hashErr, hash) => {
        if (hashErr) {
            console.error(hashErr);
            return res
                .status(500)
                .send("Error al generar hash de la contraseña.");
        }

        // Actualizar hash en la base de datos
        db.query(
            "UPDATE usuarios SET pass = ? WHERE id = ?",
            [hash, ref],
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res
                        .status(500)
                        .send("Error al actualizar la contraseña.");
                }
                // Opcional: redirigir o mandar respuesta de éxito
                res.redirect("/profile"); // o un mensaje de éxito
            }
        );
    });
});

// Ruta de cierre de sesion con regsession

// router.get("/logout", (req, res) => {
//     // req.session.destroy(() => {
//     //     res.redirect("/");
//     // });
//     req.session = null;
//     res.redirect("/");

// });

// Ruta de cierre de sesion con cookie-session

router.get("/logout", (req, res) => {
    req.session = null; // Limpiar la sesión
    res.redirect("/");
});

router.post("/saveCursos", crud.saveCursos);
router.post("/saveUser", crud.saveUser);
router.post("/updateCursos", crud.updateCursos);
router.post("/updateUser", crud.updateUser);

module.exports = router;
