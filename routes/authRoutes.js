const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../src/models/Usuario');

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

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Intento de login:', { email });

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    try {
        Usuario.verificarCredenciales(email, password, (err, usuario) => {
            if (err) {
                console.error('❌ Error en login:', err);
                return res.status(500).json({ error: 'Error del servidor' });
            }

            if (!usuario) {
                console.log('⚠️ Credenciales inválidas para:', email);
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                {
                    usuarioId: usuario.id,
                    email: usuario.email,
                    esAdmin: usuario.email.endsWith('@gmail.com')
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ Login exitoso para:', usuario.email);

            res.json({
                success: true,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.name,
                    email: usuario.email,
                    esAdmin: usuario.email.endsWith('@gmail.com')
                },
                token: token,
                message: 'Login exitoso'
            });
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Register
router.post('/register', (req, res) => {
    const { nombre, email, password, confirmarPassword } = req.body;

    console.log('👤 Intento de registro:', { nombre, email });

    if (!nombre || !email || !password || !confirmarPassword) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password !== confirmarPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    Usuario.crear({ nombre, email, password }, (err, nuevoUsuario) => {
        if (err) {
            console.error('❌ Error en registro:', err);

            if (err.message === 'El usuario ya existe') {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }

            return res.status(500).json({ error: 'Error creando usuario' });
        }

        const token = jwt.sign(
            {
                usuarioId: nuevoUsuario.id,
                email: nuevoUsuario.email,
                esAdmin: nuevoUsuario.email.endsWith('@gmail.com')
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Usuario registrado:', nuevoUsuario.email);

        res.status(201).json({
            success: true,
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.name,
                email: nuevoUsuario.email,
                esAdmin: nuevoUsuario.email.endsWith('@gmail.com')
            },
            token: token,
            message: 'Usuario registrado exitosamente'
        });
    });
});

// Verificar token y obtener perfil
router.get('/perfil', verificarToken, (req, res) => {
    Usuario.buscarPorId(req.usuarioId, (err, usuario) => {
        if (err || !usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.name,
                email: usuario.email,
                fechaRegistro: usuario.created_at,
                esAdmin: usuario.email.endsWith('@gmail.com')
            }
        });
    });
});

// Actualizar perfil
router.put('/perfil', verificarToken, (req, res) => {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    Usuario.actualizarPerfil(req.usuarioId, { nombre, email }, (err, result) => {
        if (err) {
            console.error('❌ Error actualizando perfil:', err);
            return res.status(500).json({ error: 'Error actualizando perfil' });
        }

        Usuario.buscarPorId(req.usuarioId, (err, usuarioActualizado) => {
            if (err || !usuarioActualizado) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                success: true,
                usuario: {
                    id: usuarioActualizado.id,
                    nombre: usuarioActualizado.name,
                    email: usuarioActualizado.email,
                    fechaRegistro: usuarioActualizado.created_at,
                    esAdmin: usuarioActualizado.email.endsWith('@gmail.com')
                },
                message: 'Perfil actualizado exitosamente'
            });
        });
    });
});

// Eliminar cuenta
router.delete('/cuenta', verificarToken, (req, res) => {
    Usuario.eliminarCuenta(req.usuarioId, (err, result) => {
        if (err) {
            console.error('❌ Error eliminando cuenta:', err);
            return res.status(500).json({ error: 'Error eliminando cuenta' });
        }

        res.json({
            success: true,
            message: 'Cuenta eliminada exitosamente'
        });
    });
});

// Verificar si es admin
router.get('/es-admin', verificarToken, (req, res) => {
    const esAdmin = req.usuarioEmail.endsWith('@gmail.com');

    res.json({
        success: true,
        esAdmin: esAdmin
    });
});

// Logout (solo para consistencia)
router.post('/logout', verificarToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
});

module.exports = router;