const express = require("express");
const router = express.Router();
const mySqlConnection = require("../../conexion");

//? ---------buscamos todos los datos---------
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

router.post("/updateExcel",(req, res)=>{
  const archivo=req;
  const query= "INSERT INTO matrizhogar ()value (?)"

  
})







  module.exports = router;