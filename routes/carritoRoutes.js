const express = require('express');
const router = express.Router();
const Carrito = require('../src/models/Carrito');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tu_clave_secreta_jwt_cambia_esto_en_produccion';

// Middleware de autenticación OBLIGATORIO
const autenticarObligatorio = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Debes iniciar sesión para acceder al carrito',
            requiereLogin: true
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: 'Sesión inválida. Inicia sesión nuevamente.',
                requiereLogin: true
            });
        }

        req.usuarioId = decoded.usuarioId;
        next();
    });
};

// Obtener carrito
router.get('/', autenticarObligatorio, (req, res) => {
    console.log(`📦 [GET] Obteniendo carrito para usuario autenticado: ${req.usuarioId}`);

    Carrito.obtenerCarrito(req.usuarioId, (err, carrito) => {
        if (err) {
            console.error('❌ Error en obtenerCarrito:', err);
            return res.status(500).json({
                error: 'Error del servidor al obtener carrito',
                details: err.message
            });
        }
        console.log(`✅ Carrito obtenido: ${carrito.items.length} items, total: $${carrito.total}`);
        res.json(carrito);
    });
});

// Agregar producto al carrito
router.post('/agregar', autenticarObligatorio, (req, res) => {
    const { productoId, cantidad = 1 } = req.body;

    console.log(`🛒 [POST] Agregando producto:`, {
        usuarioId: req.usuarioId,
        productoId,
        cantidad
    });

    if (!productoId) {
        return res.status(400).json({ error: 'productoId es requerido' });
    }

    Carrito.agregarProducto(req.usuarioId, productoId, cantidad, (err) => {
        if (err) {
            console.error('❌ Error en agregarProducto:', err);
            return res.status(500).json({
                error: 'Error del servidor al agregar producto',
                details: err.message
            });
        }
        console.log('✅ Producto agregado exitosamente');
        res.json({ success: true, message: 'Producto agregado al carrito' });
    });
});

// Eliminar producto del carrito
router.delete('/eliminar/:productoId', autenticarObligatorio, (req, res) => {
    const { productoId } = req.params;
    console.log(`🗑️ [DELETE] Eliminando producto ${productoId} del carrito de usuario ${req.usuarioId}`);

    Carrito.eliminarProducto(req.usuarioId, productoId, (err) => {
        if (err) {
            console.error('❌ Error eliminando producto:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json({ success: true, message: 'Producto eliminado del carrito' });
    });
});

// Actualizar cantidad
router.put('/actualizar', autenticarObligatorio, (req, res) => {
    const { productoId, cantidad } = req.body;
    console.log(`✏️ [PUT] Actualizando cantidad: producto ${productoId} a ${cantidad} para usuario ${req.usuarioId}`);

    Carrito.actualizarCantidad(req.usuarioId, productoId, cantidad, (err) => {
        if (err) {
            console.error('❌ Error actualizando cantidad:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json({ success: true, message: 'Cantidad actualizada' });
    });
});

// Vaciar carrito
router.delete('/vaciar', autenticarObligatorio, (req, res) => {
    console.log(`🚮 [DELETE] Vaciando carrito del usuario ${req.usuarioId}`);

    Carrito.vaciarCarrito(req.usuarioId, (err) => {
        if (err) {
            console.error('❌ Error vaciando carrito:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json({ success: true, message: 'Carrito vaciado' });
    });
});

module.exports = router;