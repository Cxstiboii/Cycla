class RegisterPage {
    constructor() {
        this.authManager = window.authManager;
    }

    init() {
        console.log('🔄 Inicializando página de registro...');
        this.configurarEventos();
    }

    configurarEventos() {
        const form = document.getElementById('form-register');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // Limpiar mensajes al escribir
        document.querySelectorAll('#form-register input').forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajes();
            });
        });
    }

    async register() {
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmarPassword = document.getElementById('confirmar-password').value;

        // Validaciones
        if (!nombre || !email || !password || !confirmarPassword) {
            this.mostrarError('Todos los campos son requeridos');
            return;
        }

        if (password !== confirmarPassword) {
            this.mostrarError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            this.mostrarError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        this.mostrarCargando(true);

        try {
            const result = await this.authManager.register(nombre, email, password, confirmarPassword);

            if (result.success) {
                this.mostrarExito('Registro exitoso! Redirigiendo...');

                // Redirigir después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                this.mostrarError(result.error || 'Error en el registro');
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.mostrarError('Error de conexión. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    mostrarCargando(mostrar) {
        const btnTexto = document.getElementById('btn-register-texto');
        const btnCargando = document.getElementById('btn-register-cargando');
        const btn = document.getElementById('btn-register');

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
    const registerPage = new RegisterPage();
    registerPage.init();
});