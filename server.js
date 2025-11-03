const express = require('express');
const cors = require('cors');
const path = require('path');

const productoRoutes = require('./routes/productoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
// Agrega esta línea en las importaciones
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Logging simplificado
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Rutas de la API
app.use('/api/productos', productoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/admin', adminRoutes);


// Servir archivos estáticos
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Rutas de páginas
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/productos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/productos.html'));
});

app.get('/producto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/producto.html'));
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/carrito.html'));
});

app.get('/carrito.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/carrito.html'));
});

// Agrega esta ruta en "Rutas de páginas"
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/admin.html'));
});


// Agrega esta ruta en "Rutas de páginas"
app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/perfil.html'));
});

// Agrega esta línea en las importaciones
const authRoutes = require('./routes/authRoutes');

// Agrega esta línea en "Rutas de la API"
app.use('/api/auth', authRoutes);

// Agrega estas rutas en "Rutas de páginas"
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/register.html'));
});

// Manejo de errores
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`🚀 Servidor en http://localhost:${port}`);
});

module.exports = app;