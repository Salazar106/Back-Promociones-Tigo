const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const fs = require("fs-extra");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const e = require("express");

var upload = multer({ dest: "uploads/" });
router.post("/updateFavoritos", upload.single("archivo"), (req, res) => {
  //Querys para truncate e insersion de Data en la DB
  const insertFavorito = `INSERT INTO favoritos (nombre_oferta, tecnologia, portafolio, estrato, regional, canal, nombre_del_favorito, descripcion_del_favorito, observaciones,fecha_carga) VALUES (?)`;
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
    fecha_carga:""
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
      if (Object.keys(excelData)[0] != "Favoritos") {
        res.json({
          status:201,
          msg:"El Archivo que montaste no pertenece al formato establecido!"
        }
        );
        fs.remove(filepath);
      } else {
        const hoy=new Date();
        const fecha= hoy.getFullYear()+"-"+hoy.getMonth()+"-"+hoy.getDate()+" "+hoy.getHours()+":"+hoy.getMinutes()+":"+hoy.getSeconds() 
        console.log(fecha);
        let data = [];
        let validateData = [];
        let favoritos = excelData.Favoritos;
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
          modelo.fecha_carga=fecha
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
        res.status(200).json({ msg: "Se Actualizo la tabla de Favoritos exitosamente" });
      }
    }
  } catch (error) {
    res.send("Se ha Producido un Error, vuelve a intentar");
    fs.remove(filepath);
  }
});

module.exports = router;
