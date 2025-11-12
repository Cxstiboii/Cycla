const db = require('../config/database');
const util = require('util');

// Convertir db.query a promesa
const queryAsync = util.promisify(db.query).bind(db);

class Carrito {
    // Helper para obtener ID del carrito
    static async obtenerCarritoId(usuarioId) {
        console.log(`🔍 Obteniendo ID del carrito para usuario: ${usuarioId}`);

        const query = 'SELECT id FROM carritos WHERE usuario_id = ?';
        const results = await queryAsync(query, [usuarioId]);

        if (results.length === 0) {
            // Crear nuevo carrito
            console.log(`🆕 Creando nuevo carrito para usuario: ${usuarioId}`);
            const insertQuery = 'INSERT INTO carritos (usuario_id) VALUES (?)';
            const result = await queryAsync(insertQuery, [usuarioId]);
            console.log(`✅ Nuevo carrito creado con ID: ${result.insertId}`);
            return result.insertId;
        } else {
            console.log(`📋 Carrito encontrado con ID: ${results[0].id}`);
            return results[0].id;
        }
    }

    // Obtener o crear carrito para un usuario
    static async obtenerCarrito(usuarioId) {
        console.log(`🔍 Buscando carrito para usuario: ${usuarioId}`);

        try {
            // Primero verificar si el usuario tiene carrito
            const checkQuery = 'SELECT id FROM carritos WHERE usuario_id = ?';
            const results = await queryAsync(checkQuery, [usuarioId]);

            if (results.length === 0) {
                // Crear nuevo carrito
                console.log(`🆕 Creando nuevo carrito para usuario: ${usuarioId}`);
                const insertQuery = 'INSERT INTO carritos (usuario_id) VALUES (?)';
                const result = await queryAsync(insertQuery, [usuarioId]);
                console.log(`✅ Nuevo carrito creado con ID: ${result.insertId}`);
                
                // Devolver carrito vacío
                return {
                    id: result.insertId,
                    items: [],
                    total: 0,
                    usuario_id: Number.parseInt(usuarioId, 10)
                };
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

                const items = await queryAsync(itemsQuery, [carritoId]);

                const carritoItems = items.map(item => ({
                    item_id: item.item_id,
                    producto_id: item.producto_id,
                    nombre: item.nombre_producto,
                    precio: Number.parseFloat(item.precio_unitario),
                    cantidad: item.cantidad,
                    imagen: item.imagen_url,
                    stock: item.stock_disponible,
                    subtotal: Number.parseFloat(item.subtotal)
                }));

                const total = carritoItems.reduce((sum, item) => sum + item.subtotal, 0);

                const carrito = {
                    id: carritoId,
                    usuario_id: Number.parseInt(usuarioId, 10),
                    items: carritoItems,
                    total: total
                };

                console.log(`💰 Carrito con ${carritoItems.length} items, total: $${total}`);
                return carrito;
            }
        } catch (error) {
            console.error('❌ Error en obtenerCarrito:', error);
            throw error;
        }
    }

    // Agregar producto al carrito
    static async agregarProducto(usuarioId, productoId, cantidad = 1) {
        console.log(`➕ Agregando producto ${productoId} al carrito de usuario ${usuarioId}`);

        try {
            // Primero obtener el precio del producto
            const precioQuery = 'SELECT precio_unitario FROM productos WHERE id = ?';
            const precioResults = await queryAsync(precioQuery, [productoId]);

            if (precioResults.length === 0) {
                throw new Error('Producto no encontrado');
            }

            const precioUnitario = precioResults[0].precio_unitario;

            // Obtener o crear carrito
            const carritoId = await this.obtenerCarritoId(usuarioId);

            // Verificar si el producto ya está en el carrito
            const checkQuery = 'SELECT * FROM carrito_items WHERE carrito_id = ? AND producto_id = ?';
            const results = await queryAsync(checkQuery, [carritoId, productoId]);

            if (results.length > 0) {
                // Actualizar cantidad
                console.log(`📝 Producto ya existe, actualizando cantidad`);
                const updateQuery = 'UPDATE carrito_items SET cantidad = cantidad + ?, actualizado_en = CURRENT_TIMESTAMP WHERE carrito_id = ? AND producto_id = ?';
                await queryAsync(updateQuery, [cantidad, carritoId, productoId]);
                console.log('✅ Cantidad actualizada correctamente');
            } else {
                // Insertar nuevo item
                console.log(`🆕 Insertando nuevo producto en carrito`);
                const insertQuery = 'INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
                await queryAsync(insertQuery, [carritoId, productoId, cantidad, precioUnitario]);
                console.log('✅ Producto agregado correctamente');
            }
        } catch (error) {
            console.error('❌ Error en agregarProducto:', error);
            throw error;
        }
    }

    // Eliminar producto del carrito
    static async eliminarProducto(usuarioId, productoId) {
        console.log(`🗑️ Eliminando producto ${productoId} del carrito de usuario ${usuarioId}`);

        try {
            const carritoId = await this.obtenerCarritoId(usuarioId);
            const query = 'DELETE FROM carrito_items WHERE carrito_id = ? AND producto_id = ?';
            const result = await queryAsync(query, [carritoId, productoId]);
            console.log(`✅ Producto eliminado correctamente. Filas afectadas: ${result.affectedRows}`);
        } catch (error) {
            console.error('❌ Error en eliminarProducto:', error);
            throw error;
        }
    }

    // Actualizar cantidad
    static async actualizarCantidad(usuarioId, productoId, cantidad) {
        console.log(`✏️ Actualizando cantidad del producto ${productoId} a ${cantidad}`);

        try {
            const carritoId = await this.obtenerCarritoId(usuarioId);

            if (cantidad <= 0) {
                await this.eliminarProducto(usuarioId, productoId);
            } else {
                const query = 'UPDATE carrito_items SET cantidad = ?, actualizado_en = CURRENT_TIMESTAMP WHERE carrito_id = ? AND producto_id = ?';
                const result = await queryAsync(query, [cantidad, carritoId, productoId]);
                console.log(`✅ Cantidad actualizada correctamente. Filas afectadas: ${result.affectedRows}`);
            }
        } catch (error) {
            console.error('❌ Error en actualizarCantidad:', error);
            throw error;
        }
    }

    // Vaciar carrito
    static async vaciarCarrito(usuarioId) {
        console.log(`🚮 Vaciando carrito del usuario ${usuarioId}`);

        try {
            const carritoId = await this.obtenerCarritoId(usuarioId);
            const query = 'DELETE FROM carrito_items WHERE carrito_id = ?';
            const result = await queryAsync(query, [carritoId]);
            console.log(`✅ Carrito vaciado correctamente. Filas afectadas: ${result.affectedRows}`);
        } catch (error) {
            console.error('❌ Error en vaciarCarrito:', error);
            throw error;
        }
    }
}

module.exports = Carrito;