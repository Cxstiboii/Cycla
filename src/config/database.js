const mysql = require('mysql2');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'productos_deportivos'
});

connection.connect((err) => {
    if (err){
        console.log('Error no se pudo conectar a la base de datos');
        return;
    }
    console.log('Conectado a MySQL');
});

module.exports = connection;