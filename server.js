const express = require('express');
const mysql = require('mysql2');
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
    SELECT all
    FROM productos
  `;

  connection.query(query, (err,results) => {
    if (err){
        console.error('Error en la consulta', err);
        res.status(500).json({error: 'Error del servidor'});
        return;
    }
    res.json(results);
  });
});

//Ruta principal - sirve index.html

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});