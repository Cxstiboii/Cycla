const db = require('../config/database');

class Carrito {
    // Obtener o crear carrito para un usuario
    static obtenerCarrito(usuarioId, callback) {
        console.log(`🔍 Buscando carrito para usuario: ${usuarioId}`);

        // Primero verificar si el usuario tiene carrito
        const checkQuery = 'SELECT id FROM carritos WHERE usuario_id = ?';

        db.query(checkQuery, [usuarioId], (err, results) => {
            if (err) {
                console.error('❌ Error verificando carrito:', err);
                return callback(err);
            }

            if (results.length === 0) {
                // Crear nuevo carrito
                console.log(`🆕 Creando nuevo carrito para usuario: ${usuarioId}`);
                const insertQuery = 'INSERT INTO carritos (usuario_id) VALUES (?)';
                db.query(insertQuery, [usuarioId], (err, result) => {
                    if (err) {
                        console.error('❌ Error creando carrito:', err);
                        return callback(err);
                    }
                    console.log(`✅ Nuevo carrito creado con ID: ${result.insertId}`);
                    // Devolver carrito vacío
                    callback(null, {
                        id: result.insertId,
                        items: [],
                        total: 0,
                        usuario_id: parseInt(usuarioId)
                    });
                });
            } else {
                const carritoId = results[0].id;
                console.log(`📋 Carrito encontrado con ID: ${carritoId}`);

                // Obtener items del carrito con información del producto
                const itemsQuery = `
                    SELECT 
                        ci.id as item_id,
                        ci.carrito_id,
                        ci.producto_id,
                        ci.cantidad,
                        ci.precio_unitario,
                        ci.agregado_en,
                        p.nombre_producto,
                        p.imagen_url,
                        p.cantidad as stock_disponible,
                        (ci.cantidad * ci.precio_unitario) as subtotal
                    FROM carrito_items ci
                    JOIN productos p ON ci.producto_id = p.id
                    WHERE ci.carrito_id = ?
                    ORDER BY ci.agregado_en DESC
                `;

                db.query(itemsQuery, [carritoId], (err, items) => {
                    if (err) {
                        console.error('❌ Error obteniendo items del carrito:', err);
                        return callback(err);
                    }

                    const carritoItems = items.map(item => ({
                        item_id: item.item_id,
                        producto_id: item.producto_id,
                        nombre: item.nombre_producto,
                        precio: parseFloat(item.precio_unitario),
                        cantidad: item.cantidad,
                        imagen: item.imagen_url,
                        stock: item.stock_disponible,
                        subtotal: parseFloat(item.subtotal)
                    }));

                    const total = carritoItems.reduce((sum, item) => sum + item.subtotal, 0);

                    const carrito = {
                        id: carritoId,
                        usuario_id: parseInt(usuarioId),
                        items: carritoItems,
                        total: total
                    };

                    console.log(`💰 Carrito con ${carritoItems.length} items, total: $${total}`);
                    callback(null, carrito);
                });
            }
        });
    }

    // Agregar producto al carrito
    static agregarProducto(usuarioId, productoId, cantidad = 1, callback) {
        console.log(`➕ Agregando producto ${productoId} al carrito de usuario ${usuarioId}`);

        // Primero obtener el precio del producto
        const precioQuery = 'SELECT precio_unitario FROM productos WHERE id = ?';

        db.query(precioQuery, [productoId], (err, precioResults) => {
            if (err) {
                console.error('❌ Error obteniendo precio del producto:', err);
                return callback(err);
            }

            if (precioResults.length === 0) {
                return callback(new Error('Producto no encontrado'));
            }

            const precioUnitario = precioResults[0].precio_unitario;

            // Obtener o crear carrito
            this.obtenerCarritoId(usuarioId, (err, carritoId) => {
                if (err) return callback(err);

                // Verificar si el producto ya está en el carrito
                const checkQuery = 'SELECT * FROM carrito_items WHERE carrito_id = ? AND producto_id = ?';
                db.query(checkQuery, [carritoId, productoId], (err, results) => {
                    if (err) {
                        console.error('❌ Error verificando producto en carrito:', err);
                        return callback(err);
                    }

                    if (results.length > 0) {
                        // Actualizar cantidad
                        console.log(`📝 Producto ya existe, actualizando cantidad`);
                        const updateQuery = 'UPDATE carrito_items SET cantidad = cantidad + ?, actualizado_en = CURRENT_TIMESTAMP WHERE carrito_id = ? AND producto_id = ?';
                        db.query(updateQuery, [cantidad, carritoId, productoId], (err) => {
                            if (err) {
                                console.error('❌ Error actualizando cantidad:', err);
                                return callback(err);
                            }
                            console.log('✅ Cantidad actualizada correctamente');
                            callback(null);
                        });
                    } else {
                        // Insertar nuevo item
                        console.log(`🆕 Insertando nuevo producto en carrito`);
                        const insertQuery = 'INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
                        db.query(insertQuery, [carritoId, productoId, cantidad, precioUnitario], (err) => {
                            if (err) {
                                console.error('❌ Error insertando producto:', err);
                                return callback(err);
                            }
                            console.log('✅ Producto agregado correctamente');
                            callback(null);
                        });
                    }
                });
            });
        });
    }

    // Eliminar producto del carrito
    static eliminarProducto(usuarioId, productoId, callback) {
        console.log(`🗑️ Eliminando producto ${productoId} del carrito de usuario ${usuarioId}`);

        this.obtenerCarritoId(usuarioId, (err, carritoId) => {
            if (err) return callback(err);

            const query = 'DELETE FROM carrito_items WHERE carrito_id = ? AND producto_id = ?';
            db.query(query, [carritoId, productoId], (err, result) => {
                if (err) {
                    console.error('❌ Error eliminando producto:', err);
                    return callback(err);
                }
                console.log(`✅ Producto eliminado correctamente. Filas afectadas: ${result.affectedRows}`);
                callback(null);
            });
        });
    }

    // Actualizar cantidad
    static actualizarCantidad(usuarioId, productoId, cantidad, callback) {
        console.log(`✏️ Actualizando cantidad del producto ${productoId} a ${cantidad}`);

        this.obtenerCarritoId(usuarioId, (err, carritoId) => {
            if (err) return callback(err);

            if (cantidad <= 0) {
                this.eliminarProducto(usuarioId, productoId, callback);
            } else {
                const query = 'UPDATE carrito_items SET cantidad = ?, actualizado_en = CURRENT_TIMESTAMP WHERE carrito_id = ? AND producto_id = ?';
                db.query(query, [cantidad, carritoId, productoId], (err, result) => {
                    if (err) {
                        console.error('❌ Error actualizando cantidad:', err);
                        return callback(err);
                    }
                    console.log(`✅ Cantidad actualizada correctamente. Filas afectadas: ${result.affectedRows}`);
                    callback(null);
                });
            }
        });
    }

    // Helper para obtener ID del carrito
    static obtenerCarritoId(usuarioId, callback) {
        console.log(`🔍 Obteniendo ID del carrito para usuario: ${usuarioId}`);

        const query = 'SELECT id FROM carritos WHERE usuario_id = ?';
        db.query(query, [usuarioId], (err, results) => {
            if (err) {
                console.error('❌ Error obteniendo carrito ID:', err);
                return callback(err);
            }

            if (results.length === 0) {
                // Crear nuevo carrito
                console.log(`🆕 Creando nuevo carrito para usuario: ${usuarioId}`);
                const insertQuery = 'INSERT INTO carritos (usuario_id) VALUES (?)';
                db.query(insertQuery, [usuarioId], (err, result) => {
                    if (err) {
                        console.error('❌ Error creando carrito:', err);
                        return callback(err);
                    }
                    console.log(`✅ Nuevo carrito creado con ID: ${result.insertId}`);
                    callback(null, result.insertId);
                });
            } else {
                console.log(`📋 Carrito encontrado con ID: ${results[0].id}`);
                callback(null, results[0].id);
            }
        });
    }

    // Vaciar carrito
    static vaciarCarrito(usuarioId, callback) {
        console.log(`🚮 Vaciando carrito del usuario ${usuarioId}`);

        this.obtenerCarritoId(usuarioId, (err, carritoId) => {
            if (err) return callback(err);

            const query = 'DELETE FROM carrito_items WHERE carrito_id = ?';
            db.query(query, [carritoId], (err, result) => {
                if (err) {
                    console.error('❌ Error vaciando carrito:', err);
                    return callback(err);
                }
                console.log(`✅ Carrito vaciado correctamente. Filas afectadas: ${result.affectedRows}`);
                callback(null);
            });
        });
    }
}

module.exports = Carrito;