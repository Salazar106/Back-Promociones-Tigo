const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { documento, password } = req.body;
  const validateQuery = `SELECT * FROM usuario WHERE documento = ${documento};`;

  const loginQuery = `select U.password, U.estado, R.nombre as rol, R.id from usuario U
  inner join rol R on (U.id_rol = R.id)
  where documento = ${documento};`;

  mySqlConnection.query(validateQuery, [documento], (err, usuario, fields) => {
    if (!err) {
      if (usuario.length != 0 && usuario[0].estado === "A") {

        mySqlConnection.query(loginQuery, (err, row, fields) => {

          const getAccess = `select unidad.nombre as modulo from acceso
          inner join unidad on (acceso.id_unidad = unidad.id)
          where id_rol = ${usuario.rol}`;
          

          mySqlConnection.query(getAccess, (err, access, fields) => {
            let compare = bcryptjs.compareSync(password, usuario[0].password);

            console.log(access)

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
                    rol: row[0].rol,
                    login: true,
                  });
                }
              );
            } else {
              res.status(200).json({
                status: "contraseña incorrecta",
                login: false,
              });
            }
          });
        });
      } else {
        if (usuario[0].estado === "I") {
          res.status(200).json({
            status: "usuario invalido o inactivo",
            login: false,
          });
        }
      }
    }
  });
});

//! Test--->   http://localhost:2800/login2/   !\\
router.post("/login2", (req, res) => {
  const { documento, password } = req.body;

  const loginQuery = `select U.password, U.estado, R.nombre as rol, R.id from usuario U
  inner join rol R on (U.id_rol = R.id)
  where documento = ${documento}`;

  const comparar = (documento, password, row) => {
    const getAccess = `select unidad.nombre as modulo from acceso
  inner join unidad on (acceso.id_unidad = unidad.id)
  where id_rol = ${row[0].id}`;
    mySqlConnection.query(getAccess, (err, acces, fields) => {
      let hastToHash = bcryptjs.compareSync(password, row[0].password);
      if (hastToHash) {
        jwt.sign(
          {
            documento: documento,
            password: row[0].password,
          },
          "nielpe12",
          (err, token) => {
            res.status(200).json({
              accesos: acces,
              documento: documento,
              estado: row[0].estado,
              rol: row[0].rol,
              login: true,
              token,
              msg: "login correcto",
            });
          }
        );
      } else {
        res.status(200).json({
          msg: "Contraseña Incorrecta",
          login: false,
        });
      }
    });
  };

  mySqlConnection.query(loginQuery, (err, row, fields) => {

    if (!err) {
      if (row.length >= 1 && row[0].estado === "A") {
        comparar(documento, password, row);
      } else if (row.length >= 1 && row[0].estado === "I") {
        res.status(200).json({
          msg: "Usuario Inactivo",
          login: false,
        });
      } 
      // else {
      //   res.json({
      //     status:200,
      //     msg: "Usuario no registrado",
      //     login: false,
      //   });
      // }
    } else {
      res.status(200).json({msg:"Usuario no Registrado"});
    }
  });
});

module.exports = router;
