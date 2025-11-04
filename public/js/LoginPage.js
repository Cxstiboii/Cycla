class LoginPage {
    constructor() {
        this.authManager = window.authManager;
        this.form = document.getElementById('form-login');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Verificar si hay un mensaje de redirección
        this.verificarRedireccion();

        // Limpiar mensajes al escribir
        this.configurarEventosInput();
    }

    verificarRedireccion() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');

        if (redirect) {
            console.log('🔀 Redirección configurada a:', redirect);
            // Mostrar mensaje informativo si viene del carrito
            if (redirect.includes('checkout')) {
                this.mostrarInfo('Para continuar con tu compra, inicia sesión o regístrate');
            }
        }
    }

    configurarEventosInput() {
        const inputs = document.querySelectorAll('#form-login input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajes();
            });
        });
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btnLogin = document.getElementById('btn-login');
        const btnLoginTexto = document.getElementById('btn-login-texto');
        const btnLoginCargando = document.getElementById('btn-login-cargando');

        // Reset mensajes
        this.ocultarMensajes();

        // Validación básica
        if (!email || !password) {
            this.mostrarError('Por favor completa todos los campos');
            return;
        }

        // Validación de formato de email
        if (!this.validarEmail(email)) {
            this.mostrarError('Por favor ingresa un email válido');
            return;
        }

        // Mostrar cargando
        btnLoginTexto.classList.add('hidden');
        btnLoginCargando.classList.remove('hidden');
        btnLogin.disabled = true;

        try {
            const result = await this.authManager.login(email, password);

            if (result.success) {
                this.mostrarExito('¡Login exitoso! Redirigiendo...');

                // Obtener URL de redirección
                const urlParams = new URLSearchParams(window.location.search);
                const redirectParam = urlParams.get('redirect');
                const redirectStorage = localStorage.getItem('redirectAfterLogin');

                let redirectUrl = '/';

                // Prioridad: parámetro URL > localStorage > home
                if (redirectParam) {
                    redirectUrl = redirectParam;
                } else if (redirectStorage) {
                    redirectUrl = redirectStorage;
                    localStorage.removeItem('redirectAfterLogin');
                }

                console.log('🔄 Redirigiendo a:', redirectUrl);

                // Esperar un momento para mostrar el mensaje
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                this.mostrarError(result.error || 'Error en el login. Verifica tus credenciales.');
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.mostrarError('Error de conexión. Intenta nuevamente.');
        } finally {
            // Restaurar botón
            btnLoginTexto.classList.remove('hidden');
            btnLoginCargando.classList.add('hidden');
            btnLogin.disabled = false;
        }
    }

    validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    mostrarError(mensaje) {
        const mensajeError = document.getElementById('mensaje-error');
        const mensajeExito = document.getElementById('mensaje-exito');
        const mensajeInfo = document.getElementById('mensaje-info');

        if (mensajeError) {
            mensajeError.textContent = mensaje;
            mensajeError.classList.remove('hidden');

            // Ocultar otros mensajes
            if (mensajeExito) mensajeExito.classList.add('hidden');
            if (mensajeInfo) mensajeInfo.classList.add('hidden');
        }
    }

    mostrarExito(mensaje) {
        const mensajeError = document.getElementById('mensaje-error');
        const mensajeExito = document.getElementById('mensaje-exito');
        const mensajeInfo = document.getElementById('mensaje-info');

        if (mensajeExito) {
            mensajeExito.textContent = mensaje;
            mensajeExito.classList.remove('hidden');

            // Ocultar otros mensajes
            if (mensajeError) mensajeError.classList.add('hidden');
            if (mensajeInfo) mensajeInfo.classList.add('hidden');
        }
    }

    mostrarInfo(mensaje) {
        // Si no existe un elemento para info, usar el de éxito
        const mensajeInfo = document.getElementById('mensaje-info') || document.getElementById('mensaje-exito');
        const mensajeError = document.getElementById('mensaje-error');

        if (mensajeInfo) {
            mensajeInfo.textContent = mensaje;
            mensajeInfo.className = 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded';
            mensajeInfo.classList.remove('hidden');

            // Ocultar error
            if (mensajeError) mensajeError.classList.add('hidden');
        }
    }

    ocultarMensajes() {
        const mensajeError = document.getElementById('mensaje-error');
        const mensajeExito = document.getElementById('mensaje-exito');
        const mensajeInfo = document.getElementById('mensaje-info');

        if (mensajeError) mensajeError.classList.add('hidden');
        if (mensajeExito) mensajeExito.classList.add('hidden');
        if (mensajeInfo) mensajeInfo.classList.add('hidden');
    }

    // Método para redirección externa (desde otras páginas)
    static redirigirALogin(redirectUrl = '') {
        let loginUrl = '/login.html';

        if (redirectUrl) {
            loginUrl += `?redirect=${encodeURIComponent(redirectUrl)}`;
            localStorage.setItem('redirectAfterLogin', redirectUrl);
        }

        window.location.href = loginUrl;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

// Hacer el método estático disponible globalmente
window.LoginPage = LoginPage;