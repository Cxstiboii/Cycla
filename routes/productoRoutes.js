const express = require('express');
const router = express.Router();
const Producto = require('../src/models/Producto');


// En productoRoutes.js, agrega esta ruta:
router.get('/:id', (req, res) => {
    const productoId = req.params.id;

    Producto.getById(productoId, (err, results) => {
        if (err) {
            console.log('Error: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(results[0]);
    });
});


// Ruta para productos por categoría
router.get('/categoria/:id', (req, res) => {
    const categoriaId = req.params.id;
    const limit = Number.parseInt(req.query.limit, 10) || 10;

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