const db= require("../database/db");
exports.save = (req, res) => {
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

exports.update = (req, res) => {
    const ref = req.body.referencia;
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const stock = req.body.stock;

    db.query(
        "UPDATE productos SET ? WHERE referencia = ?",[{
            nombre:nombre,
            precio:precio,
            stock:stock
        },
        ref
        ], 
        (error, results) => {
            if(error) {
                console.log(error);
                res.redirect("/admin");
            } else {
                console.log("Producto actualizado correctamente");
                res.redirect("/admin");
            }
        }
    );
};