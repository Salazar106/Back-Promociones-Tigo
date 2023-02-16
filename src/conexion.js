const mysql2 = require("mysql2");

const mySqlConnection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb",
  
});

mySqlConnection.connect(function (err) {
  if (err) {
    console.log(err);
    console.log("*************************************************");
    console.log("*   🔴 Error de conexión a la base de datos 🔴  *");
    console.log("*  Asegúrese de tener Xampp o MySQL encendidos  *");
    console.log("*************************************************");
    return;
  } else {
    console.log("")
    console.log("*   🟢 Conexión a la base de datos establecida 🟢   *");
    console.log("*****************************************************");
  }
});

module.exports = mySqlConnection; //super importante poner esto porque si no paila la app