const express = require('express');
const cors = require('cors');
const path = require('path');

const productoRoutes = require('./routes/productoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

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
app.use('/api/auth', authRoutes);

// Servir archivos estáticos
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ============= RUTAS DE PÁGINAS CORREGIDAS =============

// Página principal
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Productos
app.get('/productos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/productos.html'));
});

app.get('/producto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/producto.html'));
});

// Carrito
app.get(['/carrito', '/carrito.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/carrito.html'));
});

// Checkout
app.get(['/checkout', '/checkout.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/checkout.html'));
});

// Confirmación
app.get(['/confirmacion', '/confirmacion.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/confirmacion.html'));
});

// ============= RUTAS DE AUTENTICACIÓN =============
app.get(['/login', '/login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get(['/register', '/register.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/register.html'));
});

// ============= RUTA DE PERFIL (FALTABA) =============
app.get(['/perfil', '/perfil.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/perfil.html'));
});

// ============= RUTA DE ADMIN (FALTABA) =============
app.get(['/admin', '/admin.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views/admin.html'));
});

// Manejo de errores
app.use((req, res) => {
    console.log('❌ Ruta no encontrada:', req.url);
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`🚀 Servidor en http://localhost:${port}`);
    console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});

module.exports = app;