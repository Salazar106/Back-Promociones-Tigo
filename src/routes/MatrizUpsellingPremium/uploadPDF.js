const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const multer = require("multer");
const { appendFile } = require("fs-extra");

// con este diskStorage se da la ruta donde se van a guardar los archivos y se configura para que estos se guarden con su formato original
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/routes/MatrizUpsellingPremium/PDF-files");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// multer crea la carpeta de destino y y gestiona los archivos
const upload = multer({ storage });

//!=================Carga de archivos al servidor================\\\
router.post("/uploadpdf/", upload.any("archivo"), (req, res) => {
  try {
    res.status(200).send("Los datos se cargaron exitosamente");
  } catch (error) {
    res.status(500).send(error,'Se ha Producido un Error, vuelve a intentar');
  }
});

module.exports = router;