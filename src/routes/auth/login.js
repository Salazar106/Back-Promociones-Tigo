const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { documento, password } = req.body;
  const validateQuery = "SELECT * FROM usuario WHERE documento = ?";

  const loginQuery = `select U.password, U.estado, R.nombre as rol, R.id from usuario U
  inner join rol R on (U.id_rol = R.id)
  where documento = ${documento};`

  let values = "a"   

  mySqlConnection.query(validateQuery, [documento], (err, usuario, fields) => {
    if (!err) {

      if (usuario.length != 0 && usuario[0].estado === 'A') {

        mySqlConnection.query(loginQuery, [documento], (err, row, fields) => {

          const getAccess = `select unidad.nombre as modulo from acceso
          inner join unidad on (acceso.id_unidad = unidad.id)
          where id_rol = ${row[0].id}`

          mySqlConnection.query(getAccess, (err, access, fields) => {

            let compare = bcryptjs.compareSync(password, usuario[0].password)

            if (compare) {
              jwt.sign(
                {
                  documento: documento,
                  password: usuario[0].password,
                },
                "secretkey",
                (err, token) => {
                  res.status(200).json({
                    accesos: access,
                    estado: row[0].estado,
                    token: token,
                    rol:row[0].rol,
                    login:true
                  });
                }
              );
            } else {
              res.status(200).json({
                status: "contraseña incorrecta",
                login: false
              });
            }
        })});
      } else {


        if(usuario[0].estado === 'I'){
          res.status(200).json({  
            status: "usuario invalido o inactivo",
            login: false
          });
        }
        
      }
    }
  });
});

module.exports = router;
