//9 1 Iniciar las librerias

const express = require("express");
const router = express();
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const {body, validation, validationResult} = require("express-validator");
const crud = require("./controllers"); // para usar las operaciones CRUD

//9 4 definimos una ruta de entrada (para enviar las vistas)

router.get("/",(req,res) => {
    if (req.session.loggedin){
        res.render("index",{
            user: req.session.name, 
            login: true, 
            titulo:"Home"
        });
    }else{
        res.render("index",{
            user: "Debe iniciar sessión", 
            login: false, 
            titulo:"Home"
        });
    }
    // res.render("index",{user:"Dani"});
});

router.get("/login",(req,res) => {
    res.render("login",{ titulo: "Login" });
});

router.get("/register",(req,res) => {
    res.render("register", { titulo:"Registro" });
});

router.get("/admin",(req,res) => {
    // res.render("admin");
    db.query("SELECT * FROM productos", (error, results) => {
        if(error){
            throw error;
        } else {
            // console.log(results);
            res.render("admin", {
                productos: results,               
            });
        }
});
});

router.get("/create", (req, res) => {
    res.render("create");
});

//9 8 definimos las rutas de post
//  definimos las rutas insert

router.post("/register", [
    body("user")
        .isLength({ min: 4 })
        .withMessage("El usuario debe tener 4 caracteres"),
    body("name")
        .isLength({ min: 4 })
        .withMessage("El nombre debe tener 4 caracteres"),
    body("pass")
        .isLength({ min: 4 })
        .withMessage("El pass debe tener 4 caracteres"),
    body("email")
        .isEmail()
        .withMessage("El email no es válido"),
    body("edad")
        .isNumeric()
        .withMessage("La edad debe ser un número"),
    body("rol") // si usas rol, valida también
        .notEmpty()
        .withMessage("El rol es obligatorio"),
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
    }else{
        
        const { user, name, pass, rol } = req.body;
        const passwordHash = await bcrypt.hash(pass, 8);
    
        db.query(
            "INSERT INTO usuarios SET ?",
            {
                Usuario: user,
                Nombre: name,
                rol: rol,
                pass: passwordHash,
            },
            (error, results) => {
                if (error) {
                    console.error(error);
                    // Opcional: enviar respuesta de error
                    return res.render("register", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Hubo un problema al registrar el usuario.",
                        alertIcon: "error",
                        titulo: "Registro",
                    });
                } else {
                    res.render("register", {
                        alert: true,
                        alertTitle: "Register",
                        alertMessage: "El usuario se ha registrado correctamente",
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

});

// definimos la ruta de login
router.post("/auth", async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    if (user && pass){
        db.query(
            "SELECT * FROM usuarios WHERE usuario = ? ", 
            [user], 
            async(error,results) => {
                if(
                    results.length == 0 
                    || !(await bcrypt.compare(pass, results[0].pass))){
                        // res.send(
                        //      "El usuario no existe o la contraseña es incorrecta"
                        // );
                        res.render("login" , {
                            alert: true ,
                            alertTitle: "Error" ,
                            alertMessage: "El usuario no existe o la contraseña es incorrecta" ,
                            alertIcon: "error" ,
                            showConfirmButton: true ,
                            timer: false ,
                            ruta: "login" ,
                            login: false,
                            titulo: "Login",
                        })
                    }else{
                        req.session.loggedin =true;
                        req.session.name = results[0].nombre;
                        // res.send("El usuario se ha logeado correctamente");
                        res.render("login" , {
                            alert: true,
                            alertTitle: "Login" ,
                            alertMessage:"El usuario se ha logeado correctamente",
                            alertIcon:"success",
                            showConfirmButton: false,
                            timer:2500,
                            ruta:"",
                            login: true,
                            titulo: "Login",
                        })
                    }

        });
    }else{
         res.render("login" , {
                            alert: true,
                            alertTitle: "Login" ,
                            alertMessage:"Introduzca su usuario y contraseña",
                            alertIcon:"success",
                            showConfirmButton: false,
                            timer:2500,
                            ruta:"",
                            login: false,
                            titulo: "Login",
                        })

    }
});

// Ruta de cierre de sesion

    router.get("/logout", (req, res) => {
        req.session.destroy(() => {
            res.redirect("/");
        });
    });

router.post("/save",crud.save); 

module.exports = router;