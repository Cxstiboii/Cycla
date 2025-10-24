const express = require('express');
const cors = require('cors');
const path = require('path');


const productoRoutes = require('./routes/productoRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ✅ Usar rutas organizadas
app.use('/api/productos', productoRoutes);

// ✅ Mantener tu ruta actual funcionando
app.get('/api/productos-old', (req, res) => {
    const query = `SELECT * FROM productos`;
    
    // Tu conexión actual
    const connection = require('./src/config/database');
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta', err);
            res.status(500).json({ error: 'Error del servidor' });
            return;
        }
        res.json(results);
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

// En tu server.js, asegúrate de servir la carpeta public
app.use(express.static('.')); // Esto ya lo tienes, sirve todo
// o más específico:
app.use('/public', express.static('public'));