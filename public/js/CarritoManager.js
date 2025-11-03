class CarritoManager {
    constructor(apiBase = 'http://localhost:3000/api') {
        this.apiBase = apiBase;
        this.authManager = window.authManager || {
            estaAutenticado: () => false,
            getToken: () => null,
            getUsuario: () => null
        };
        this.carrito = {
            id: null,
            usuario_id: null,
            items: [],
            total: 0
        };
        this.isInitialized = false;
    }

    obtenerUsuarioId() {
        if (this.authManager && this.authManager.estaAutenticado()) {
            return this.authManager.getUsuario().id;
        }
        return null;
    }

    async inicializar() {
        if (this.isInitialized) return;

        try {
            console.log('🚀 Inicializando CarritoManager...');

            if (!this.authManager.estaAutenticado()) {
                console.log('⚠️ Usuario no autenticado, carrito no disponible');
                this.carrito = this.crearCarritoVacio();
                return;
            }

            const result = await this.obtenerCarrito();

            if (result.success) {
                this.isInitialized = true;
                console.log('✅ CarritoManager inicializado correctamente');
            } else {
                console.warn('⚠️ CarritoManager no se pudo inicializar completamente:', result.error);
            }
        } catch (error) {
            console.error('❌ Error inicializando CarritoManager:', error);
        }
    }

    async obtenerCarrito() {
        try {
            const usuarioId = this.obtenerUsuarioId();

            if (!usuarioId) {
                console.warn('⚠️ No hay usuario autenticado para obtener carrito');
                this.carrito = this.crearCarritoVacio();
                return {
                    success: false,
                    error: 'Usuario no autenticado',
                    carrito: this.carrito
                };
            }

            console.log('🛒 Obteniendo carrito para usuario:', usuarioId);

            const response = await fetch(`${this.apiBase}/carrito`, {
                headers: {
                    'Authorization': `Bearer ${this.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const carritoData = await response.json();
                console.log('📦 Carrito obtenido:', {
                    id: carritoData.id,
                    itemsCount: carritoData.items?.length || 0,
                    total: carritoData.total
                });

                this.carrito = {
                    ...carritoData,
                    usuario_id: usuarioId
                };

                return {
                    success: true,
                    carrito: this.carrito,
                    message: 'Carrito cargado correctamente'
                };
            } else if (response.status === 401) {
                console.warn('🔐 Usuario no autenticado para carrito');
                this.carrito = this.crearCarritoVacio();
                return {
                    success: false,
                    error: 'Usuario no autenticado',
                    requiereLogin: true,
                    carrito: this.carrito
                };
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                console.warn('⚠️ No se pudo obtener el carrito:', response.status, errorData);
                this.carrito = this.crearCarritoVacio();
                return {
                    success: false,
                    error: errorData,
                    carrito: this.carrito
                };
            }
        } catch (error) {
            console.error('❌ Error obteniendo carrito:', error);
            this.carrito = this.crearCarritoVacio();
            return {
                success: false,
                error: error.message,
                carrito: this.carrito
            };
        }
    }

    crearCarritoVacio() {
        return {
            id: null,
            usuario_id: null,
            items: [],
            total: 0
        };
    }

    async agregarProducto(productoId, cantidad = 1) {
        try {
            if (!this.authManager.estaAutenticado()) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para agregar productos al carrito',
                    requiereLogin: true
                };
            }

            console.log(`➕ Agregando producto ${productoId} al carrito (cantidad: ${cantidad})`);

            if (!productoId) {
                throw new Error('ID de producto es requerido');
            }

            const response = await fetch(`${this.apiBase}/carrito/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authManager.getToken()}`
                },
                body: JSON.stringify({
                    productoId: parseInt(productoId),
                    cantidad: parseInt(cantidad)
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('✅ Producto agregado correctamente al carrito');
                await this.obtenerCarrito();
                return {
                    success: true,
                    data: responseData,
                    carrito: this.carrito,
                    message: 'Producto agregado al carrito'
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para agregar productos al carrito',
                    requiereLogin: true
                };
            } else {
                console.error('❌ Error del servidor al agregar producto:', response.status, responseData);
                return {
                    success: false,
                    error: responseData,
                    message: responseData.error || 'Error al agregar producto al carrito'
                };
            }
        } catch (error) {
            console.error('❌ Error agregando producto:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error de conexión al agregar producto'
            };
        }
    }

    async eliminarProducto(productoId) {
        try {
            if (!this.authManager.estaAutenticado()) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para gestionar el carrito',
                    requiereLogin: true
                };
            }

            console.log(`🗑️ Eliminando producto ${productoId} del carrito`);

            if (!productoId) {
                throw new Error('ID de producto es requerido');
            }

            const response = await fetch(`${this.apiBase}/carrito/eliminar/${productoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authManager.getToken()}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('✅ Producto eliminado correctamente del carrito');
                await this.obtenerCarrito();
                return {
                    success: true,
                    data: responseData,
                    carrito: this.carrito,
                    message: 'Producto eliminado del carrito'
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para gestionar el carrito',
                    requiereLogin: true
                };
            } else {
                console.error('❌ Error del servidor al eliminar producto:', response.status, responseData);
                return {
                    success: false,
                    error: responseData,
                    message: responseData.error || 'Error al eliminar producto del carrito'
                };
            }
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error de conexión al eliminar producto'
            };
        }
    }

    async actualizarCantidad(productoId, cantidad) {
        try {
            if (!this.authManager.estaAutenticado()) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para gestionar el carrito',
                    requiereLogin: true
                };
            }

            console.log(`✏️ Actualizando cantidad del producto ${productoId} a ${cantidad}`);

            if (!productoId || cantidad === undefined) {
                throw new Error('ID de producto y cantidad son requeridos');
            }

            const response = await fetch(`${this.apiBase}/carrito/actualizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authManager.getToken()}`
                },
                body: JSON.stringify({
                    productoId: parseInt(productoId),
                    cantidad: parseInt(cantidad)
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('✅ Cantidad actualizada correctamente');
                await this.obtenerCarrito();
                return {
                    success: true,
                    data: responseData,
                    carrito: this.carrito,
                    message: 'Cantidad actualizada'
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para gestionar el carrito',
                    requiereLogin: true
                };
            } else {
                console.error('❌ Error del servidor al actualizar cantidad:', response.status, responseData);
                return {
                    success: false,
                    error: responseData,
                    message: responseData.error || 'Error al actualizar cantidad'
                };
            }
        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error de conexión al actualizar cantidad'
            };
        }
    }

    async vaciarCarrito() {
        try {
            if (!this.authManager.estaAutenticado()) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para gestionar el carrito',
                    requiereLogin: true
                };
            }

            console.log('🚮 Vaciando carrito completo');

            const response = await fetch(`${this.apiBase}/carrito/vaciar`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authManager.getToken()}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('✅ Carrito vaciado correctamente');
                await this.obtenerCarrito();
                return {
                    success: true,
                    data: responseData,
                    carrito: this.carrito,
                    message: 'Carrito vaciado'
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'Debes iniciar sesión para gestionar el carrito',
                    requiereLogin: true
                };
            } else {
                console.error('❌ Error del servidor al vaciar carrito:', response.status, responseData);
                return {
                    success: false,
                    error: responseData,
                    message: responseData.error || 'Error al vaciar carrito'
                };
            }
        } catch (error) {
            console.error('❌ Error vaciando carrito:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error de conexión al vaciar carrito'
            };
        }
    }

    formatearPrecio(precio) {
        if (!precio && precio !== 0) return '$0';
        return `$${parseFloat(precio).toLocaleString('es-CO')}`;
    }

    getTotalItems() {
        return this.carrito.items ?
            this.carrito.items.reduce((sum, item) => sum + (item.cantidad || 0), 0) : 0;
    }

    getItemCount() {
        return this.carrito.items ? this.carrito.items.length : 0;
    }

    getTotal() {
        return this.carrito.total || 0;
    }

    getItems() {
        return this.carrito.items || [];
    }

    getCarritoId() {
        return this.carrito.id;
    }

    getUsuarioId() {
        return this.obtenerUsuarioId();
    }

    tieneProducto(productoId) {
        return this.carrito.items ?
            this.carrito.items.some(item => item.producto_id == productoId) : false;
    }

    getCantidadProducto(productoId) {
        if (!this.carrito.items) return 0;
        const item = this.carrito.items.find(item => item.producto_id == productoId);
        return item ? item.cantidad : 0;
    }

    debug() {
        console.log('🔍 Debug CarritoManager:', {
            usuarioId: this.getUsuarioId(),
            isInitialized: this.isInitialized,
            carrito: {
                id: this.carrito.id,
                usuario_id: this.carrito.usuario_id,
                itemsCount: this.getItemCount(),
                totalItems: this.getTotalItems(),
                total: this.getTotal()
            },
            items: this.getItems()
        });
    }

    estaVacio() {
        return this.getItemCount() === 0;
    }

    reiniciar() {
        this.carrito = this.crearCarritoVacio();
        console.log('🔄 Carrito local reiniciado');
    }

    cambiarUsuario(nuevoUsuarioId) {
        if (nuevoUsuarioId && nuevoUsuarioId !== this.getUsuarioId()) {
            this.isInitialized = false;
            this.reiniciar();
            console.log('👤 Usuario cambiado a:', nuevoUsuarioId);
        }
    }
}

window.CarritoManager = CarritoManager;