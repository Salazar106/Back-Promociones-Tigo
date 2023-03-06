const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const fs = require("fs-extra");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");



//! ---------Convertir excel a Json y guardar en DB----------
//localhost:2800/updateExcel/
var upload = multer({ dest: "uploads/" });
router.post("/updateExcel", upload.single("archivo"), (req, res) => {
  //Query para insersion de Data en la DB
  const insertQuery =
    "INSERT INTO matrizhogar (ano, mes, promocion, andina, costa, sur, bogota, tiendas, televentas, digital, fvd, retail, dealer, description, tipocliente, region, vigencia, observacion, adjunto) VALUES (?)";
  //Query para limpiar la tabla mediante TRUNCATE
  const truncateQuery = "TRUNCATE TABLE matrizhogar";
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
      const EspecialChatarters = /[\^*@!"#$%&/()=?¡!¿'\\]/gi; //Caracteres especiales que se desean eliminar
      let data = [];
      let validateData = [];
      let matriz = excelData.Matriz;
      fs.remove(filepath);

      //Se crea modelo para insercion de datos
      const modelo = {
        ano: "",
        mes: "",
        promocion: "",
        andina: "",
        costa: "",
        sur: "",
        bogota: "",
        tiendas: "",
        televentas: "",
        digital: "",
        fvd: "",
        retail: "",
        dealer: "",
        descripcion: "",
        tipocliente: "",
        region: "",
        vigencia: "",
        observaciones: "",
        adjunto: "",
      };
      //Se obtienen los datos del Json segun el modelo y se meten en una Variable 'data' y se eliminan Caracteres especiales con el Replace()
      matriz.forEach((e) => {
        modelo.ano = String(e.ANO) || "";
        modelo.mes = e.MES || "";
        modelo.promocion = e.PROMOCION || "";
        modelo.andina = String(e.ANDINA) || "";
        modelo.costa = String(e.COSTA) || "";
        modelo.sur = String(e.SUR) || "";
        modelo.bogota = String(e.BOGOTA) || "";
        modelo.tiendas = String(e.Tiendas) || "";
        modelo.televentas = String(e.Televentas) || "";
        modelo.digital = String(e.Digital) || "";
        modelo.fvd = String(e.FVD) || "";
        modelo.retail = String(e.Retail) || "";
        modelo.dealer = String(e.Dealer) || "";
        modelo.descripcion = e.DESCRIPCION || "";
        modelo.tipocliente = e.TIPOCLIENTE || "";
        modelo.region = e.REGION || "";
        modelo.vigencia = e.Vigencia || "";
        modelo.observaciones = e.Observaciones || "";
        modelo.adjunto = e.Adjunto || "";
        data.push(Object.values(modelo));
      });

      // Funcion para eliminar espacions de mas en una cadena de texto ejemplo 'hola     buenos     dias' => 'hola buenos dias' ?\\
      const withoutSpaces=(element)=>{
        let spa=element.split(' ').filter(i => i !== '')
        element=spa.join(" ")
        return element
        }
     
     
        data.forEach((e) => {
        validateData.push(
          e.flatMap((z) => [withoutSpaces(z.replace(EspecialChatarters, "").trim())])
        );
      })


      // Se realiza TRUNCATE en la DB
      mySqlConnection.query(truncateQuery, (err, rows, fields) => {
        if (err) {
          console.log(err);
        }
      });
      console.table(data);
      console.table(validateData);

      // se realiza INSERT en la DB
      validateData.forEach((row) => {
        mySqlConnection.query(insertQuery, [row], (err) => {
          if (err) {
            res.send("Algo malo ocurrio, vuelve a intentarlo");
            console.log(err);
          }
        });
      });

      res.status(200).send({ msg: "Se Actualizo la data exitosamente" });
    }
  } catch (error) {
    res.status(500).send(error, "Se ha Producido un Error, vuelve a intentar");
  }
});

module.exports = router;
