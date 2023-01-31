const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");
const XLSX = require("xlsx");
const fs = require("fs-extra");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const { json } = require("express");
const { end } = require("../../conexion");

//? ---------buscamos todos los datos---------
//localhost:3200/allData/
router.get("/allData", (req, res) => {
  const query = "SELECT * FROM matrizHogar";
  mySqlConnection.query(query, (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});

//? ---------Convertir excel a Json----------
//localhost:3200/updateExcel/

var upload = multer({ dest: "uploads/" });
router.post("/updateExcel", upload.single("file"), (req, res) => {
  const insertQuery =
    "INSERT INTO matrizhogar (ano, mes, promocion, andina, costa, sur, bogota, tiendas, televentas, digital, fvd, retail, dealer, description, tipocliente, region, vigencia, adjunto, observacion) VALUES (?)";
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
      let a = [];
      let data = [];
      let espaciosFaltantes = [" ", " "];
      let matriz = excelData.Matriz;
      fs.remove(filepath);

      const modelo={
        ano:"",
        mes:"",
        promocion:"",
        andina:"",
        costa:"",
        sur:"",
        bogota:"",
        tiendas:"",
        televentas:"",
        digital:"",
        fvd:"",
        retail:"",
        dealer:"",
        descripcion:"",
        tipocliente:"",
        region:"",
        vigencia:"",
        observaciones:"",
        adjunto:"",
       }

      matriz.forEach((e) => {
        modelo.ano=String(e.ANO) || ''
        modelo.mes=e.MES || ''
        modelo.promocion=e.PROMOCION || '' 
        modelo.andina=String(e.ANDINA) || ''
        modelo.costa=String(e.COSTA) || ''
        modelo.sur=String(e.SUR )|| ''
        modelo.bogota=String(e.BOGOTA) || ''
        modelo.tiendas=String(e.Tiendas)  || ''
        modelo.televentas=String(e.Televentas) || ''
        modelo.digital=String(e.Digital) || ''
        modelo.fvd=String(e.FVD)  || ''
        modelo.retail=String(e.Retail) || ''
        modelo.dealer=String(e.Dealer) || ''
        modelo.descripcion=e.DESCRIPCION || ''
        modelo.tipocliente=e.TIPOCLIENTE || ''
        modelo.region=e.REGION || ''
        modelo.vigencia=e.Vigencia || ''
        modelo.observaciones=e.Observaciones || ''
        modelo.adjunto=e.Adjunto || ''
         data.push(Object.values(modelo))
      });

      // //? se realiza truncate de la tabla
      mySqlConnection.query(truncateQuery, (err, rows, fields) => {
        if (err) {
          console.log(err);
        }
      });

      //? se realiza insercion de datos

      data.forEach(row=>{
        mySqlConnection.query(insertQuery,[row], (err) => {
          if (err) {
            console.log(err);
          }
        });
      })
      
      res.status(200).send(data);
    }
  } catch (error) {
    res.status(500);
  }
});

module.exports = router;
