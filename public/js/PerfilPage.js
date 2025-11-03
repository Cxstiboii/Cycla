class PerfilPage {
    constructor() {
        this.authManager = window.authManager;
        this.usuario = null;
    }

    async init() {
        console.log('🔄 Inicializando página de perfil...');

        // Verificar autenticación
        if (!this.authManager.estaAutenticado()) {
            window.location.href = '/login';
            return;
        }

        try {
            await this.cargarPerfil();
            this.configurarEventos();
            this.actualizarNavbar();

            console.log('✅ Página de perfil inicializada');
        } catch (error) {
            console.error('❌ Error inicializando perfil:', error);
            this.mostrarError('Error cargando perfil');
        }
    }

    async cargarPerfil() {
        try {
            const response = await fetch(`${this.authManager.apiBase}/auth/perfil`, {
                headers: this.authManager.getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.usuario = data.usuario;
                this.mostrarInformacionUsuario();
            } else {
                throw new Error(data.error || 'Error cargando perfil');
            }
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            throw error;
        }
    }

    mostrarInformacionUsuario() {
        // Información principal
        document.getElementById('nombre-usuario').textContent = this.usuario.nombre;
        document.getElementById('email-usuario').textContent = this.usuario.email;
        document.getElementById('nombre-usuario-nav').textContent = this.usuario.nombre;

        // Formulario
        document.getElementById('nombre').value = this.usuario.nombre;
        document.getElementById('email').value = this.usuario.email;

        // Información adicional
        document.getElementById('fecha-registro').textContent =
            new Date(this.usuario.fechaRegistro).toLocaleDateString('es-ES');

        document.getElementById('tipo-cuenta').textContent =
            this.usuario.esAdmin ? 'Administrador' : 'Usuario estándar';
    }

    configurarEventos() {
        // Tabs
        document.querySelectorAll('.tab-perfil').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.cambiarTab(e.target.dataset.tab);
            });
        });

        // Formulario
        document.getElementById('form-perfil').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarPerfil();
        });

        // Eliminar cuenta
        document.getElementById('btn-eliminar-cuenta').addEventListener('click', () => {
            this.mostrarModalEliminar();
        });

        document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => {
            this.ocultarModalEliminar();
        });

        document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
            this.eliminarCuenta();
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            this.authManager.logout();
        });

        // Limpiar mensajes al escribir
        document.querySelectorAll('#form-perfil input').forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajes();
            });
        });
    }

    cambiarTab(tab) {
        // Actualizar tabs
        document.querySelectorAll('.tab-perfil').forEach(t => {
            t.classList.remove('border-blue-500', 'text-blue-600');
            t.classList.add('border-transparent', 'text-gray-500');
        });

        document.querySelector(`[data-tab="${tab}"]`).classList.add('border-blue-500', 'text-blue-600');
        document.querySelector(`[data-tab="${tab}"]`).classList.remove('border-transparent', 'text-gray-500');

        // Mostrar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`tab-${tab}`).classList.remove('hidden');
    }

    async guardarPerfil() {
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;

        if (!nombre || !email) {
            this.mostrarError('Nombre y email son requeridos');
            return;
        }

        this.mostrarCargando(true);

        try {
            const response = await fetch(`${this.authManager.apiBase}/auth/perfil`, {
                method: 'PUT',
                headers: this.authManager.getAuthHeaders(),
                body: JSON.stringify({ nombre, email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Actualizar datos locales
                this.authManager.usuario = data.usuario;
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                this.mostrarExito('Perfil actualizado exitosamente');
                this.actualizarNavbar();
            } else {
                this.mostrarError(data.error || 'Error actualizando perfil');
            }

        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            this.mostrarError('Error de conexión. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    async eliminarCuenta() {
        try {
            const response = await fetch(`${this.authManager.apiBase}/auth/cuenta`, {
                method: 'DELETE',
                headers: this.authManager.getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.ocultarModalEliminar();
                this.mostrarExito('Cuenta eliminada exitosamente');

                // Redirigir al home después de 2 segundos
                setTimeout(() => {
                    this.authManager.logout();
                }, 2000);
            } else {
                this.mostrarError(data.error || 'Error eliminando cuenta');
            }

        } catch (error) {
            console.error('❌ Error eliminando cuenta:', error);
            this.mostrarError('Error de conexión. Intenta nuevamente.');
        }
    }

    mostrarModalEliminar() {
        document.getElementById('modal-eliminar-cuenta').classList.remove('hidden');
    }

    ocultarModalEliminar() {
        document.getElementById('modal-eliminar-cuenta').classList.add('hidden');
    }

    actualizarNavbar() {
        const nombreUsuario = document.getElementById('nombre-usuario-nav');
        if (nombreUsuario && this.usuario) {
            nombreUsuario.textContent = this.usuario.nombre;
        }
    }

    mostrarCargando(mostrar) {
        const btnTexto = document.getElementById('btn-texto');
        const btnCargando = document.getElementById('btn-cargando');
        const btn = document.getElementById('btn-guardar');

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
    const perfilPage = new PerfilPage();
    perfilPage.init();
});