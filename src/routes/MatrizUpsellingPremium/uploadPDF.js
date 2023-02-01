const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const multer = require("multer");
const { appendFile } = require("fs-extra");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/routes/MatrizUpsellingPremium/PDF");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post("/uploadpdf", upload.array("archivos"), (req, res) => {
  try {
    res.status(200).send("Los datos se cargaron exitosamente");
  } catch (error) {
    res.status(500).send(error,'Se ha Producido un Error, vuelve a intentar');
  }
});

module.exports = router;
