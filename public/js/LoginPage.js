class LoginPage {
    constructor() {
        this.authManager = window.authManager;
    }

    init() {
        console.log('🔄 Inicializando página de login...');
        this.configurarEventos();
    }

    configurarEventos() {
        const form = document.getElementById('form-login');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Limpiar mensajes al escribir
        document.querySelectorAll('#form-login input').forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajes();
            });
        });
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.mostrarError('Email y contraseña son requeridos');
            return;
        }

        this.mostrarCargando(true);

        try {
            const result = await this.authManager.login(email, password);

            if (result.success) {
                this.mostrarExito('Login exitoso! Redirigiendo...');

                // Redirigir después de 1 segundo
                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get('redirect') || '/';
                    window.location.href = redirect;
                }, 1000);
            } else {
                this.mostrarError(result.error || 'Error en el login');
            }

        } catch (error) {
            console.error('❌ Error en login:', error);
            this.mostrarError('Error de conexión. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    mostrarCargando(mostrar) {
        const btnTexto = document.getElementById('btn-login-texto');
        const btnCargando = document.getElementById('btn-login-cargando');
        const btn = document.getElementById('btn-login');

        if (mostrar) {
            btnTexto.classList.add('hidden');
            btnCargando.classList.remove('hidden');
            btn.disabled = true;
        } else {
            btnTexto.classList.remove('hidden');
            btnCargando.classList.add('hidden');
            btn.disabled = false;
        }
    }

    mostrarExito(mensaje) {
        const exitoDiv = document.getElementById('mensaje-exito');
        const errorDiv = document.getElementById('mensaje-error');

        exitoDiv.textContent = mensaje;
        exitoDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    }

    mostrarError(mensaje) {
        const exitoDiv = document.getElementById('mensaje-exito');
        const errorDiv = document.getElementById('mensaje-error');

        errorDiv.textContent = mensaje;
        errorDiv.classList.remove('hidden');
        exitoDiv.classList.add('hidden');
    }

    ocultarMensajes() {
        document.getElementById('mensaje-exito').classList.add('hidden');
        document.getElementById('mensaje-error').classList.add('hidden');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const loginPage = new LoginPage();
    loginPage.init();
});