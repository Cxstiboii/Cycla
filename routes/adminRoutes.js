const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ============= IMPORTAR LA BASE DE DATOS (FALTABA) =============
const db = require('../src/config/database');

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
        req.esAdmin = decoded.esAdmin;  // Agregar flag de admin
        next();
    });
};

// ============= VERIFICAR ADMIN MEJORADO =============
const verificarAdmin = (req, res, next) => {
    console.log('🔐 Verificando permisos de admin:', {
        usuarioId: req.usuarioId,
        email: req.usuarioEmail,
        esAdmin: req.esAdmin
    });

    // Verificar si el usuario es admin (viene del token)
    if (!req.esAdmin) {
        console.log('❌ Acceso denegado: Usuario no es administrador');
        return res.status(403).json({
            error: 'Acceso denegado. Se requiere cuenta de administrador.',
            esAdmin: false
        });
    }

    console.log('✅ Acceso de admin concedido');
    next();
};

// Obtener todos los productos (con paginación)
router.get('/productos', verificarToken, verificarAdmin, (req, res) => {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
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
        Number.parseFloat(precio_unitario),
        Number.parseInt(cantidad, 10) || 0,
        imagen_url || '',
        Number.parseInt(fk_id_tipo_Producto, 10)
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
            precio_unitario: Number.parseFloat(precio_unitario),
            cantidad: Number.parseInt(cantidad, 10) || 0,
            imagen_url: imagen_url || '',
            fk_id_tipo_Producto: Number.parseInt(fk_id_tipo_Producto, 10)
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
        Number.parseFloat(precio_unitario),
        Number.parseInt(cantidad, 10),
        imagen_url,
        Number.parseInt(fk_id_tipo_Producto, 10),
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
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM productos) as totalProductos,
            (SELECT COUNT(*) FROM tipo_producto) as totalCategorias,
            (SELECT COUNT(*) FROM productos WHERE cantidad < 10) as productosBajoStock,
            (SELECT SUM(precio_unitario * cantidad) FROM productos) as valorTotalInventario
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error obteniendo estadísticas:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        const stats = results[0];
        res.json({
            totalProductos: stats.totalProductos,
            totalCategorias: stats.totalCategorias,
            productosBajoStock: stats.productosBajoStock,
            valorTotalInventario: stats.valorTotalInventario || 0
        });
    });
});

module.exports = router;