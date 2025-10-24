const db = require('../config/database');

class Producto {
    static getByCategoria(categoriaId, limit = 5, callback) {
        // ✅ CONSULTA CORREGIDA: Usa tipo_producto en lugar de categorias
        const query = `
            SELECT p.*, tp.Categoria as categoria_nombre 
            FROM productos p 
            JOIN tipo_producto tp ON p.fk_id_tipo_Producto = tp.id 
            WHERE p.fk_id_tipo_Producto = ? 
            LIMIT ?
        `;

        db.query(query, [categoriaId, limit], callback);
    }

    static getAll(callback) {
        const query = `SELECT * FROM productos`;
        db.query(query, callback);
    }

    static getById(id, callback) {
        const query = `SELECT * FROM productos WHERE id = ?`;
        db.query(query, [id], callback);
    }

    // 🆕 Método para obtener productos por IDs específicos
    static getByIds(ids, callback) {
        if (!ids || ids.length === 0) {
            return callback(null, []);
        }
        
        const placeholders = ids.map(() => '?').join(',');
        const query = `SELECT * FROM productos WHERE id IN (${placeholders})`;
        
        db.query(query, ids, callback);
    }

    // 🆕 Método para obtener todas las categorías
    static getCategorias(callback) {
        const query = `SELECT * FROM tipo_producto`;
        db.query(query, callback);
    }
}

module.exports = Producto;