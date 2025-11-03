const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
    // Buscar usuario por email
    static buscarPorEmail(email, callback) {
        const query = 'SELECT * FROM usuarios WHERE email = ?';

        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('❌ Error buscando usuario:', err);
                return callback(err);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            callback(null, results[0]);
        });
    }

    // Buscar usuario por ID
    static buscarPorId(id, callback) {
        const query = 'SELECT id, name, email, created_at FROM usuarios WHERE id = ?';

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('❌ Error buscando usuario por ID:', err);
                return callback(err);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            callback(null, results[0]);
        });
    }

    // Crear nuevo usuario
    static crear(usuarioData, callback) {
        const { nombre, email, password } = usuarioData;

        // Verificar si el usuario ya existe
        this.buscarPorEmail(email, (err, usuarioExistente) => {
            if (err) return callback(err);

            if (usuarioExistente) {
                return callback(new Error('El usuario ya existe'));
            }

            // Hash de la contraseña
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('❌ Error hasheando password:', err);
                    return callback(err);
                }

                const query = 'INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)';

                db.query(query, [nombre, email, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('❌ Error creando usuario:', err);
                        return callback(err);
                    }

                    console.log('✅ Usuario creado con ID:', result.insertId);

                    // Devolver usuario sin password
                    const nuevoUsuario = {
                        id: result.insertId,
                        name: nombre,
                        email: email,
                        created_at: new Date()
                    };

                    callback(null, nuevoUsuario);
                });
            });
        });
    }

    // Verificar credenciales
    static verificarCredenciales(email, password, callback) {
        this.buscarPorEmail(email, (err, usuario) => {
            if (err) return callback(err);

            if (!usuario) {
                return callback(null, false);
            }

            // Verificar password
            bcrypt.compare(password, usuario.password, (err, esValida) => {
                if (err) {
                    console.error('❌ Error verificando password:', err);
                    return callback(err);
                }

                if (!esValida) {
                    return callback(null, false);
                }

                // Devolver usuario sin password
                const usuarioSinPassword = {
                    id: usuario.id,
                    name: usuario.name,
                    email: usuario.email,
                    created_at: usuario.created_at
                };

                callback(null, usuarioSinPassword);
            });
        });
    }

    // Actualizar perfil de usuario
    static actualizarPerfil(usuarioId, datosActualizados, callback) {
        const { nombre, email } = datosActualizados;

        // Verificar si el nuevo email ya existe en otro usuario
        const checkEmailQuery = 'SELECT id FROM usuarios WHERE email = ? AND id != ?';

        db.query(checkEmailQuery, [email, usuarioId], (err, results) => {
            if (err) {
                console.error('❌ Error verificando email:', err);
                return callback(err);
            }

            if (results.length > 0) {
                return callback(new Error('El email ya está en uso por otro usuario'));
            }

            // Actualizar perfil
            const updateQuery = 'UPDATE usuarios SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

            db.query(updateQuery, [nombre, email, usuarioId], (err, result) => {
                if (err) {
                    console.error('❌ Error actualizando perfil:', err);
                    return callback(err);
                }

                if (result.affectedRows === 0) {
                    return callback(new Error('Usuario no encontrado'));
                }

                console.log('✅ Perfil actualizado para usuario ID:', usuarioId);
                callback(null, result);
            });
        });
    }

    // Eliminar cuenta de usuario
    static eliminarCuenta(usuarioId, callback) {
        console.log('🗑️ Eliminando cuenta del usuario ID:', usuarioId);

        // Primero eliminar items del carrito del usuario
        const eliminarCarritoQuery = 'DELETE FROM carrito_items WHERE carrito_id IN (SELECT id FROM carritos WHERE usuario_id = ?)';

        db.query(eliminarCarritoQuery, [usuarioId], (err) => {
            if (err) {
                console.error('❌ Error eliminando carrito items:', err);
                return callback(err);
            }

            console.log('✅ Carrito items eliminados');

            // Luego eliminar el carrito
            const eliminarCarritoPrincipalQuery = 'DELETE FROM carritos WHERE usuario_id = ?';
            db.query(eliminarCarritoPrincipalQuery, [usuarioId], (err) => {
                if (err) {
                    console.error('❌ Error eliminando carrito principal:', err);
                    return callback(err);
                }

                console.log('✅ Carrito principal eliminado');

                // Finalmente eliminar el usuario
                const eliminarUsuarioQuery = 'DELETE FROM usuarios WHERE id = ?';
                db.query(eliminarUsuarioQuery, [usuarioId], (err, result) => {
                    if (err) {
                        console.error('❌ Error eliminando usuario:', err);
                        return callback(err);
                    }

                    if (result.affectedRows === 0) {
                        return callback(new Error('Usuario no encontrado'));
                    }

                    console.log('✅ Cuenta eliminada para usuario ID:', usuarioId);
                    callback(null, result);
                });
            });
        });
    }

    // Cambiar contraseña (para futuras implementaciones)
    static cambiarPassword(usuarioId, nuevaPassword, callback) {
        bcrypt.hash(nuevaPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error('❌ Error hasheando nueva password:', err);
                return callback(err);
            }

            const query = 'UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

            db.query(query, [hashedPassword, usuarioId], (err, result) => {
                if (err) {
                    console.error('❌ Error cambiando password:', err);
                    return callback(err);
                }

                if (result.affectedRows === 0) {
                    return callback(new Error('Usuario no encontrado'));
                }

                console.log('✅ Password cambiada para usuario ID:', usuarioId);
                callback(null, result);
            });
        });
    }

    // Obtener todos los usuarios (solo para admin)
    static obtenerTodos(callback) {
        const query = 'SELECT id, name, email, created_at, updated_at FROM usuarios ORDER BY created_at DESC';

        db.query(query, (err, results) => {
            if (err) {
                console.error('❌ Error obteniendo usuarios:', err);
                return callback(err);
            }

            callback(null, results);
        });
    }

    // Verificar si usuario es admin (por email)
    static esAdmin(email, callback) {
        if (!email) {
            return callback(null, false);
        }

        const esAdmin = email.endsWith('@gmail.com');
        callback(null, esAdmin);
    }

    // Obtener estadísticas de usuarios (para dashboard admin)
    static obtenerEstadisticas(callback) {
        const queries = {
            totalUsuarios: 'SELECT COUNT(*) as total FROM usuarios',
            usuariosHoy: 'SELECT COUNT(*) as total FROM usuarios WHERE DATE(created_at) = CURDATE()',
            usuariosSemana: 'SELECT COUNT(*) as total FROM usuarios WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        };

        db.query(queries.totalUsuarios, (err, result1) => {
            if (err) return callback(err);

            db.query(queries.usuariosHoy, (err, result2) => {
                if (err) return callback(err);

                db.query(queries.usuariosSemana, (err, result3) => {
                    if (err) return callback(err);

                    callback(null, {
                        totalUsuarios: result1[0].total,
                        nuevosHoy: result2[0].total,
                        nuevosSemana: result3[0].total
                    });
                });
            });
        });
    }

    // Buscar usuarios por nombre o email (para admin)
    static buscarUsuarios(termino, callback) {
        const query = `
            SELECT id, name, email, created_at 
            FROM usuarios 
            WHERE name LIKE ? OR email LIKE ?
            ORDER BY created_at DESC
            LIMIT 50
        `;

        const terminoBusqueda = `%${termino}%`;

        db.query(query, [terminoBusqueda, terminoBusqueda], (err, results) => {
            if (err) {
                console.error('❌ Error buscando usuarios:', err);
                return callback(err);
            }

            callback(null, results);
        });
    }

    // Obtener usuario con información extendida (para perfil)
    static obtenerPerfilCompleto(usuarioId, callback) {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.created_at,
                u.updated_at,
                (SELECT COUNT(*) FROM carritos c WHERE c.usuario_id = u.id) as tiene_carrito,
                (SELECT COUNT(*) FROM carrito_items ci 
                 JOIN carritos c ON ci.carrito_id = c.id 
                 WHERE c.usuario_id = u.id) as total_productos_carrito
            FROM usuarios u
            WHERE u.id = ?
        `;

        db.query(query, [usuarioId], (err, results) => {
            if (err) {
                console.error('❌ Error obteniendo perfil completo:', err);
                return callback(err);
            }

            if (results.length === 0) {
                return callback(new Error('Usuario no encontrado'));
            }

            callback(null, results[0]);
        });
    }
}

module.exports = Usuario;