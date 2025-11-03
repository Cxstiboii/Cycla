const express = require('express');
const router = express.Router();
const Producto = require('../src/models/Producto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tu_clave_secreta_jwt_cambia_esto_en_produccion';

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        req.usuarioId = decoded.usuarioId;
        req.usuarioEmail = decoded.email;
        next();
    });
};

// Middleware para verificar si es admin (email @gmail.com)
const verificarAdmin = (req, res, next) => {
    if (!req.usuarioEmail || !req.usuarioEmail.endsWith('@gmail.com')) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere cuenta de administrador (@gmail.com).' });
    }
    next();
};

// Obtener todos los productos (con paginación)
router.get('/productos', verificarToken, verificarAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.*, tp.Categoria as categoria_nombre 
        FROM productos p 
        JOIN tipo_producto tp ON p.fk_id_tipo_Producto = tp.id 
        LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM productos`;

    db.query(countQuery, (err, countResults) => {
        if (err) {
            console.error('❌ Error contando productos:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(query, [limit, offset], (err, results) => {
            if (err) {
                console.error('❌ Error obteniendo productos:', err);
                return res.status(500).json({ error: 'Error del servidor' });
            }

            res.json({
                productos: results,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });
        });
    });
});

// Obtener un producto por ID
router.get('/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const productoId = req.params.id;

    const query = `
        SELECT p.*, tp.Categoria as categoria_nombre 
        FROM productos p 
        JOIN tipo_producto tp ON p.fk_id_tipo_Producto = tp.id 
        WHERE p.id = ?
    `;

    db.query(query, [productoId], (err, results) => {
        if (err) {
            console.error('❌ Error obteniendo producto:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(results[0]);
    });
});

// Crear nuevo producto
router.post('/productos', verificarToken, verificarAdmin, (req, res) => {
    const {
        nombre_producto,
        descripcion,
        precio_unitario,
        cantidad,
        imagen_url,
        fk_id_tipo_Producto
    } = req.body;

    if (!nombre_producto || !precio_unitario || !fk_id_tipo_Producto) {
        return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    const query = `
        INSERT INTO productos 
        (nombre_producto, descripcion, precio_unitario, cantidad, imagen_url, fk_id_tipo_Producto) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        nombre_producto,
        descripcion || '',
        parseFloat(precio_unitario),
        parseInt(cantidad) || 0,
        imagen_url || '',
        parseInt(fk_id_tipo_Producto)
    ], (err, result) => {
        if (err) {
            console.error('❌ Error creando producto:', err);
            return res.status(500).json({ error: 'Error creando producto' });
        }

        console.log('✅ Producto creado con ID:', result.insertId);

        const nuevoProducto = {
            id: result.insertId,
            nombre_producto,
            descripcion: descripcion || '',
            precio_unitario: parseFloat(precio_unitario),
            cantidad: parseInt(cantidad) || 0,
            imagen_url: imagen_url || '',
            fk_id_tipo_Producto: parseInt(fk_id_tipo_Producto)
        };

        res.status(201).json({
            success: true,
            producto: nuevoProducto,
            message: 'Producto creado exitosamente'
        });
    });
});

// Actualizar producto
router.put('/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const productoId = req.params.id;
    const {
        nombre_producto,
        descripcion,
        precio_unitario,
        cantidad,
        imagen_url,
        fk_id_tipo_Producto
    } = req.body;

    const query = `
        UPDATE productos 
        SET nombre_producto = ?, descripcion = ?, precio_unitario = ?, 
            cantidad = ?, imagen_url = ?, fk_id_tipo_Producto = ?
        WHERE id = ?
    `;

    db.query(query, [
        nombre_producto,
        descripcion,
        parseFloat(precio_unitario),
        parseInt(cantidad),
        imagen_url,
        parseInt(fk_id_tipo_Producto),
        productoId
    ], (err, result) => {
        if (err) {
            console.error('❌ Error actualizando producto:', err);
            return res.status(500).json({ error: 'Error actualizando producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        console.log('✅ Producto actualizado:', productoId);

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente'
        });
    });
});

// Eliminar producto
router.delete('/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const productoId = req.params.id;

    const query = 'DELETE FROM productos WHERE id = ?';

    db.query(query, [productoId], (err, result) => {
        if (err) {
            console.error('❌ Error eliminando producto:', err);
            return res.status(500).json({ error: 'Error eliminando producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        console.log('✅ Producto eliminado:', productoId);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    });
});

// Obtener categorías
router.get('/categorias', verificarToken, verificarAdmin, (req, res) => {
    const query = 'SELECT * FROM tipo_producto';

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error obteniendo categorías:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        res.json(results);
    });
});

// Estadísticas del dashboard
router.get('/estadisticas', verificarToken, verificarAdmin, (req, res) => {
    const queries = {
        totalProductos: 'SELECT COUNT(*) as total FROM productos',
        totalCategorias: 'SELECT COUNT(*) as total FROM tipo_producto',
        productosBajoStock: 'SELECT COUNT(*) as total FROM productos WHERE cantidad < 10',
        valorTotalInventario: 'SELECT SUM(precio_unitario * cantidad) as total FROM productos'
    };

    db.query(queries.totalProductos, (err, result1) => {
        if (err) return res.status(500).json({ error: 'Error del servidor' });

        db.query(queries.totalCategorias, (err, result2) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });

            db.query(queries.productosBajoStock, (err, result3) => {
                if (err) return res.status(500).json({ error: 'Error del servidor' });

                db.query(queries.valorTotalInventario, (err, result4) => {
                    if (err) return res.status(500).json({ error: 'Error del servidor' });

                    res.json({
                        totalProductos: result1[0].total,
                        totalCategorias: result2[0].total,
                        productosBajoStock: result3[0].total,
                        valorTotalInventario: result4[0].total || 0
                    });
                });
            });
        });
    });
});

module.exports = router;