const { response } = require("express");
const express = require("express"); // import express
const app = express(); // create express app
const cors = require("cors");

app.set("port", process.env.PORT || 2800); // set the port
const whiteList = ["http://locahost:2800"];

app.use(express.json()); // for parsing application/json

app.use(
  cors(
  //   {
  //   origin: whiteList,
  // }
  )
);

app.listen(app.get("port"), () => {

  console.log("")
  console.log("*********************************************************");
  console.log("🟡 🟡 🟡 Servidor establecido en el puerto:", app.get("port") , "🟡 🟡 🟡");
}); //poner en el puerto 3000

//!----------- Rutas--------------


//?--------Ruta de PromoHogares--------
app.use(require("./routes/Favoritos/favoritos"));
app.use(require("./routes/MatrizUpsellingPremium/excelToJson"));
app.use(require("./routes/MatrizUpsellingPremium/uploadPDF"));
app.use(require("./routes/auth/login"))

