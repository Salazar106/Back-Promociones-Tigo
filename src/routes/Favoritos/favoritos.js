const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const fs = require("fs-extra");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");

var upload = multer({ dest: "uploads/" });
router.post("/updateFavoritos", upload.single("archivo"), (req, res) => {
  //Query para insersion de Data en la DB
  const insertFavorito = `INSERT INTO favoritos (nombre_oferta, tecnologia, portafolio, estrato, regional, canal, nombre_del_favorito, descripcion_del_favorito, observaciones) VALUES (?)`;
  const truncateQuery = `TRUNCATE TABLE favoritos`;
  try {
    if (req.file?.filename == null || req.file?.filename == "undefined") {
      res.status(400).json("No hay Archivo");
    } else {
      var filepath = "uploads/" + req.file.filename;
      const excelData = excelToJson({
        sourceFile: filepath,
        header: {
          rows: 1,
        },
        columnToKey: {
          "*": "{{columnHeader}}",
        },
      });
      let data = [];
      let validateData = [];
      let favoritos = excelData.Hoja1;
      fs.remove(filepath);

      //Se crea modelo para insercion de datos
      const modelo = {
        nombre_oferta: "",
        tecnologia: "",
        portafolio: "",
        estrato: "",
        regional: "",
        canal: "",
        nombre_del_favorito: "",
        descripcion_del_favorito: "",
        observaciones: "",
      };
      //Se obtienen los datos del Json segun el modelo y se meten en una Variable 'data' y se eliminan Caracteres especiales con el Replace()
      favoritos.forEach((element) => {
        modelo.nombre_oferta = element.Nombre_Oferta || "";
        modelo.tecnologia = element.Tecnologia || "";
        modelo.portafolio = element.Portafolio || "";
        modelo.estrato = element.Estrato || "";
        modelo.regional = element.Regional || "";
        modelo.canal = element.Canal || "";
        modelo.nombre_del_favorito = element.Nombre_del_favorito || "";
        modelo.descripcion_del_favorito =
          element.Descripción_del_favorito || "";
        modelo.observaciones = element.Observaciones || "";
        data.push(Object.values(modelo));
      });

      // Funcion para eliminar espacions de mas en una cadena de texto ejemplo 'hola     buenos     dias' => 'hola buenos dias' ?\\
      const withoutSpaces = (element) => {
        let spa = element.split(" ").filter((i) => i !== "");
        element = spa.join(" ");
        return element;
      };
      data.forEach((e) => {
        validateData.push(e.flatMap((z) => [withoutSpaces(z.trim())]));
      });

      // Se realiza TRUNCATE en la DB
      mySqlConnection.query(truncateQuery, (err, rows, fields) => {
        if (err) {
          console.log(err);
        }
      });

      // se realiza INSERT en la DB
      validateData.forEach((row) => {
        mySqlConnection.query(insertFavorito, [row], (err) => {
          if (err) {
            res.send("Algo malo ocurrio, vuelve a intentarlo");
            console.log(err);
          }
        });
      });

      res.status(200).send({ msg: "Se Actualizo la data exitosamente" });
    }
  } catch (error) {
    res.send(error, "Se ha Producido un Error, vuelve a intentar");
  }
});

router.post("/updateFavoritos2", upload.single("archivo"), (req, res) => {
  //Querys para truncate e insersion de Data en la DB
  const insertFavorito = `INSERT INTO favoritos (nombre_oferta, tecnologia, portafolio, estrato, regional, canal, nombre_del_favorito, descripcion_del_favorito, observaciones) VALUES (?)`;
  const truncateQuery = `TRUNCATE TABLE favoritos`;
  //Se crea modelo para insercion de datos
  const modelo = {
    nombre_oferta: "",
    tecnologia: "",
    portafolio: "",
    estrato: "",
    regional: "",
    canal: "",
    nombre_del_favorito: "",
    descripcion_del_favorito: "",
    observaciones: "",
  };
  // Funcion para eliminar espacions de mas en una cadena de texto ejemplo 'hola     buenos     dias' => 'hola buenos dias' ?\\
  const withoutSpaces = (element) => {
    let spa = element.split(" ").filter((i) => i !== "");
    element = spa.join(" ");
    return element;
  };
  try {
    if (req.file?.filename == null || req.file?.filename == "undefined") {
      res.status(400).json("No hay Archivo");
    }else {
      var filepath = "uploads/" + req.file.filename;
      const excelData = excelToJson({
        sourceFile: filepath,
        header: {
          rows: 1,
        },
        columnToKey: {
          "*": "{{columnHeader}}",
        },
      });
      let data = [];
      let validateData = [];
      let favoritos = excelData.Hoja1;
      fs.remove(filepath);

      //Se obtienen los datos del Json segun el modelo y se meten en una Variable 'data' y se eliminan Caracteres especiales con el Replace()
      favoritos.forEach((element) => {
        modelo.nombre_oferta = element.Nombre_Oferta || "";
        modelo.tecnologia = element.Tecnologia || "";
        modelo.portafolio = element.Portafolio || "";
        modelo.estrato = element.Estrato || "";
        modelo.regional = element.Regional || "";
        modelo.canal = element.Canal || "";
        modelo.nombre_del_favorito = element.Nombre_del_favorito || "";
        modelo.descripcion_del_favorito =
          element.Descripción_del_favorito || "";
        modelo.observaciones = element.Observaciones || "";
        data.push(Object.values(modelo));
      });

      
      data.forEach((e) => {
        validateData.push(e.flatMap((z) => [withoutSpaces(z.trim())]));
      });

      // Se realiza TRUNCATE en la DB
      mySqlConnection.query(truncateQuery, (err, rows, fields) => {
        if (!err) {
          // se realiza INSERT en la DB
          validateData.forEach((row) => {
            mySqlConnection.query(insertFavorito, [row], (err) => {
              if (err) {
                res.send("Algo malo ocurrio, vuelve a intentarlo");
                console.log(err);
              }
            });
          });
        }
      });

      res.status(200).send({ msg: "Se Actualizo la tabla de Favoritos exitosamente" });
    }
  } catch (error) {
    res.send( "Se ha Producido un Error, vuelve a intentar");
  }
});

module.exports = router;
