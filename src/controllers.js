const db= require("../database/db");

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

exports.saveUser = (req, res) => {
    const nombre =req.body.nombre;
    const precio = req.body.precio;
    const stock = req.body.stock;

    // console.log(nombre+ " "+ precio, " "+ stock);
    db.query("INSERT INTO productos SET ?", 
        {
            nombre:nombre, 
            precio:precio, 
            stock:stock
        }, 
        (error, results) => {
            if (error) {
                console.log(error);
                res.direct("/admin");
                
            }else {
                console.log("Producto insertado correctamente");
                res.redirect("/admin");
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

// exports.update = (req, res) => {
//     const ref = req.body.referencia;
//     const nombre = req.body.nombre;
//     const precio = req.body.precio;
//     const stock = req.body.stock;

//     db.query(
//         "UPDATE productos SET ? WHERE referencia = ?",[{
//             nombre:nombre,
//             precio:precio,
//             stock:stock
//         },
//         ref
//         ], 
//         (error, results) => {
//             if(error) {
//                 console.log(error);
//                 res.redirect("/admin");
//             } else {
//                 console.log("Producto actualizado correctamente");
//                 res.redirect("/admin");
//             }
//         }
//     );
// };