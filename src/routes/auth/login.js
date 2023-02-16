const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { documento, password } = req.body;
  const validateQuery = "SELECT * FROM usuario WHERE documento = ?";
  const loginQuery =
    "select u.*, r.nombre as rol,GROUP_CONCAT(a.id_unidad) as accesos, u2.nombre  FROM usuario u join rol r on u.id_rol = r.id join acceso a on r.id = a.id_rol JOIN unidad u2 on u2.id = a.id_unidad where u.documento = ?";

  mySqlConnection.query(validateQuery, [documento], (err, usuario, fields) => {
    if (!err) {
      if (usuario.length != 0 && usuario[0].estado==1) {
        mySqlConnection.query(loginQuery, [documento], (err, row, fields) => {
          let compare = bcryptjs.compareSync(password, row[0].password);
          if (compare) {
            jwt.sign(
              {
                documento: documento,
                password: row[0].password,
              },
              "secretkey",
              (err, token) => {
                res.status(200).json({
                  status: "Login exitoso",
                  accesos: row[0].accesos,
                  estado: row[0].estado,
                  token: token,
                });
              }
            );
          } else {
            res.status(403).json({
              status: "contraseña incorrecta",
            });
          }
        });
      } else {
        res.status(400).json({ msg: "Ocurrio un error, vuelve a intentar" });
      }
    }
  });
});

module.exports = router;
