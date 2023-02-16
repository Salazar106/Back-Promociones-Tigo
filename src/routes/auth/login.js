const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  function compare(documento, password, usuarioRegistrado) {
    let compare = bcryptjs.compareSync(password, usuarioRegistrado[0].password);
    if (compare) {
      jwt.sign(
        {
          documento: documento,
          password: usuarioRegistrado[0].password,
        },
        "secretkey",
        (err, token) => {
          res.json({
            status: "Login exitoso",
            statusCode: 200,
            accesos: usuarioRegistrado[0].accesos,
            estado: usuarioRegistrado[0].estado,
            token: token,
          });
        }
      );
    } else {
      res.json({
        status: "contraseña incorrecta",
        statusCode: 403,
      });
    }
  }

  const { documento, password } = req.body;
  const validateQuery = "SELECT * FROM usuario WHERE documento = ?";
  const loginQuery =
    "select u.*, r.nombre as rol,GROUP_CONCAT(a.id_unidad) as accesos, u2.nombre  FROM usuario u join rol r on u.id_rol = r.id join acceso a on r.id = a.id_rol JOIN unidad u2 on u2.id = a.id_unidad where u.documento = ?";

  mySqlConnection.query(validateQuery, [validateQuery], (err, row, fields) => {
    if (row==="") {
      mySqlConnection.query(loginQuery, [documento], (err, rows, fields) => {
        if (!err) {
          if (rows.length >= 1) {
            compare(documento, password, rows);
          }
        } else {
          res.json({
            status: "no estas registrado",
            statusCode: 403,
          });
        }
      });
    } else {
      res.json({
        satus: 404,
        msg: "Usuario no registrado",
      });
    }
  });
});

module.exports = router;
