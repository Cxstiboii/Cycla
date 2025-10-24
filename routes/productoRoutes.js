const express = require('express');
const router = express.Router();
const Producto = require('../src/models/Producto');

// Ruta para productos por categoría
router.get('/categoria/:id', (req, res) => {
    const categoriaId = req.params.id;
    const limit = parseInt(req.query.limit) || 5;

    Producto.getByCategoria(categoriaId, limit, (err, results) => {
        if (err) {
            console.log('Error: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
});

// Ruta para obtener todas las categorías
router.get('/categorias', (req, res) => {
    Producto.getCategorias((err, results) => {
        if (err) {
            console.log('Error: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
});

// Ruta para todos los productos
router.get('/', (req, res) => {
    Producto.getAll((err, results) => {
        if (err) {
            console.log('Error: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
});

module.exports = router;