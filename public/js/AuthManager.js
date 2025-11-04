// js/AuthManager.js
class AuthManager {
    constructor(apiBase = 'http://localhost:3000/api') {
        this.apiBase = apiBase;
        this.token = localStorage.getItem('authToken');
        this.usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    }


    // En AuthManager.js - Agregar después del constructor
    setUsuario(usuario) {
        this.usuario = usuario;
        localStorage.setItem('usuario', JSON.stringify(this.usuario));

        // Disparar evento de cambio de estado
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: {
                estaAutenticado: true,
                usuario: this.usuario
            }
        }));
    }

// Modificar el método login para usar setUsuario
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.token = data.token;
                this.setUsuario(data.usuario); // Usar setUsuario en lugar de asignación directa

                localStorage.setItem('authToken', this.token);

                return { success: true, usuario: this.usuario };
            } else {
                return { success: false, error: data.error || 'Error en login' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

// Modificar logout para disparar evento
    logout() {
        this.token = null;
        this.usuario = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');

        // Disparar evento de cambio de estado
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: {
                estaAutenticado: false,
                usuario: null
            }
        }));

        window.location.href = '/views/index.html';
    }

    estaAutenticado() {
        return !!this.token && !!this.usuario;
    }

    getToken() {
        return this.token;
    }

    getUsuario() {
        return this.usuario;
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.token = data.token;
                this.usuario = data.usuario;

                localStorage.setItem('authToken', this.token);
                localStorage.setItem('usuario', JSON.stringify(this.usuario));

                return { success: true, usuario: this.usuario };
            } else {
                return { success: false, error: data.error || 'Error en login' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    async register(nombre, email, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Error en registro' };
            }
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    logout() {
        this.token = null;
        this.usuario = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/';
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async verificarAutenticacion() {
        if (!this.estaAutenticado()) {
            return false;
        }

        try {
            const response = await fetch(`${this.apiBase}/auth/verificar`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return false;
        }
    }


    // js/AuthManager.js - Agregar al final de la clase
    setUsuario(usuario) {
        this.usuario = usuario;
        localStorage.setItem('usuario', JSON.stringify(this.usuario));

        // Disparar evento de cambio de estado
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { estaAutenticado: true, usuario: this.usuario }
        }));
    }

// Modificar el método login para usar setUsuario
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.token = data.token;
                this.setUsuario(data.usuario); // Usar setUsuario en lugar de asignación directa

                localStorage.setItem('authToken', this.token);

                return { success: true, usuario: this.usuario };
            } else {
                return { success: false, error: data.error || 'Error en login' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }
}

// Inicializar AuthManager globalmente
window.authManager = new AuthManager();