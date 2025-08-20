const db= require("../database/db");
const bcrypt = require('bcryptjs');


/**
 * controlador para guardar los cursos
 * @param {*} req 
 * @param {*} res 
 */
exports.saveCursos = (req, res) => {
    const titulo =req.body.titulo;
    const descripcion = req.body.descripcion;
    const visibilidad = req.body.visibilidad;

    // console.log(nombre+ " "+ precio, " "+ stock);
    db.query("INSERT INTO cursos SET ?", 
        {
            titulo:titulo, 
            descripcion:descripcion, 
            visibilidad:visibilidad
        }, 
        (error, results) => {
            if (error) {
                console.log(error);
                res.direct("/cursos");
                
            }else {
                console.log("Curso insertado correctamente");
                res.redirect("/cursos");
            }
            
        } 
    );
};

exports.updateCursos = (req, res) => {
    const ref = req.body.referencia;
    const titulo = req.body.titulo;
    const descripcion = req.body.descripcion;
    const visibilidad = req.body.visibilidad;

    db.query(
        "UPDATE cursos SET ? WHERE referencia = ?",[{
            titulo:titulo,
            descripcion:descripcion,
            visibilidad:visibilidad,
        },
        ref
        ],
        (error, results) => {
            if(error) {
                console.log(error);
                res.redirect("/cursos");
            } else {
                console.log("Curso actualizado correctamente");
                res.redirect("/cursos");
            }
        }
    );
};

exports.saveUser = (req, res) => {
    const ref = req.body.id;
    const usuario = req.body.usuario;
    const nombre = req.body.nombre;
    const rol = req.body.rol;
    const pass = req.body.pass;
    const email = req.body.email;

    // console.log(nombre+ " "+ precio, " "+ stock);
    db.query("INSERT INTO usuarios SET ?", 
        {
            usuario:usuario,
            nombre:nombre,
            rol:rol,
            pass:pass,
            email:email,
        }, 
        (error, results) => {
            if (error) {
                console.log(error);
                res.direct("/admin");
                
            }else {
                console.log("Usuario insertado correctamente");
                res.redirect("/admin");
            }
            
        } 
    );
};



exports.updateUser = async (req, res) => {
    const ref = req.body.id;
    const usuario = req.body.usuario;
    const nombre = req.body.nombre;
    const rol = req.body.rol;
    const pass = req.body.pass;
    const email = req.body.email;

    // db.query(
    //     "UPDATE usuarios SET ? WHERE id = ?",[{
    //         usuario:usuario,
    //         nombre:nombre,
    //         rol:rol,
    //         password:password,
    //         email:email,
    //     },
    //     ref
    //     ], 
    //     (error, results) => {
    //         if(error) {
    //             console.log(error);
    //             res.redirect("/admin");
    //         } else {
    //             console.log("Usuario actualizado correctamente");
    //             res.redirect("/admin");
    //         }
    //     }
    // );
    let hashedPassword = pass;
    if (pass && pass.length > 0) {
    const saltRounds = 10;
    hashedPassword = await bcrypt.hash(pass, saltRounds);
    }

    db.query(
    "UPDATE usuarios SET usuario = ?, nombre = ?, rol = ?, pass = ?, email = ? WHERE id = ?",
    [usuario, nombre, rol, hashedPassword, email, ref],
    (error, results) => {
        if (error) {
        console.log(error);
        return res.status(500).redirect("/admin");
        } else {
        console.log("Usuario actualizado correctamente");
        return res.redirect("/admin");
        }
    }
    );
};