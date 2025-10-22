const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');


const app = express();
const port = 3000;


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); //Sirve para los archivos estaticos

//Conexion a MYSQL 
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'productos_deportivos'
});

//Conectar a la base de datos
connection.connect((err) => {
    if (err){
        console.error('Error a la conexion de base de datos MySQL', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

//Ruta para obtener los productos
app.get('/api/productos', (req,res) => {
    const query = `
    SELECT id, nombre_producto, cantidad, precio_unitario, fk_id_vendedor, fk_id_tipo_Producto, imagen_url 
    FROM productos
  `;

  connection.query(query(err,results)) => {
    if (err){
        console.log()
    }
  }
});