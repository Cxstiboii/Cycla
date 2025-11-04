class CarritoManager {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.isInitialized = true; // Siempre inicializado porque es local
    }

    inicializar() {
        console.log('🔄 Inicializando CarritoManager (local)...');
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        console.log('✅ CarritoManager inicializado correctamente');
        return Promise.resolve();
    }

    agregarProducto(productoId, cantidad = 1, productoData = null) {
        try {
            console.log(`➕ Agregando producto ${productoId} al carrito local (cantidad: ${cantidad})`);

            if (!productoId) {
                throw new Error('ID de producto es requerido');
            }

            // Buscar si el producto ya está en el carrito
            const productoExistente = this.carrito.find(item => item.id === productoId);

            if (productoExistente) {
                // Si ya existe, incrementar la cantidad
                productoExistente.cantidad += parseInt(cantidad);
            } else {
                // Si no existe, agregar nuevo producto
                const nuevoProducto = {
                    id: productoId,
                    nombre: productoData?.nombre || `Producto ${productoId}`,
                    precio: productoData?.precio || 0,
                    cantidad: parseInt(cantidad),
                    imagen: productoData?.imagen || '/assets/placeholder.jpg'
                };
                this.carrito.push(nuevoProducto);
            }

            this.guardarCarrito();

            console.log('✅ Producto agregado correctamente al carrito local');
            return {
                success: true,
                carrito: this.carrito,
                message: 'Producto agregado al carrito'
            };
        } catch (error) {
            console.error('❌ Error agregando producto:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al agregar producto al carrito'
            };
        }
    }

    eliminarProducto(productoId) {
        try {
            console.log(`🗑️ Eliminando producto ${productoId} del carrito local`);

            if (!productoId) {
                throw new Error('ID de producto es requerido');
            }

            this.carrito = this.carrito.filter(item => item.id !== productoId);
            this.guardarCarrito();

            console.log('✅ Producto eliminado correctamente del carrito');
            return {
                success: true,
                carrito: this.carrito,
                message: 'Producto eliminado del carrito'
            };
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al eliminar producto del carrito'
            };
        }
    }

    actualizarCantidad(productoId, cantidad) {
        try {
            console.log(`✏️ Actualizando cantidad del producto ${productoId} a ${cantidad}`);

            if (!productoId || cantidad === undefined) {
                throw new Error('ID de producto y cantidad son requeridos');
            }

            const producto = this.carrito.find(item => item.id === productoId);

            if (producto) {
                producto.cantidad = parseInt(cantidad);

                // Si la cantidad es 0, eliminar el producto
                if (producto.cantidad <= 0) {
                    return this.eliminarProducto(productoId);
                }

                this.guardarCarrito();

                console.log('✅ Cantidad actualizada correctamente');
                return {
                    success: true,
                    carrito: this.carrito,
                    message: 'Cantidad actualizada'
                };
            } else {
                throw new Error('Producto no encontrado en el carrito');
            }
        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al actualizar cantidad'
            };
        }
    }

    vaciarCarrito() {
        try {
            console.log('🚮 Vaciando carrito completo');

            this.carrito = [];
            this.guardarCarrito();

            console.log('✅ Carrito vaciado correctamente');
            return {
                success: true,
                carrito: this.carrito,
                message: 'Carrito vaciado'
            };
        } catch (error) {
            console.error('❌ Error vaciando carrito:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al vaciar carrito'
            };
        }
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        this.dispararEventoCarritoActualizado();
    }

    dispararEventoCarritoActualizado() {
        const event = new CustomEvent('carritoActualizado', {
            detail: { carrito: this.carrito }
        });
        document.dispatchEvent(event);
    }

    formatearPrecio(precio) {
        if (!precio && precio !== 0) return '$0';
        return `$${parseFloat(precio).toLocaleString('es-CO')}`;
    }

    getTotalItems() {
        return this.carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    }

    getItemCount() {
        return this.carrito.length;
    }

    getTotal() {
        return this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    getItems() {
        return this.carrito;
    }

    tieneProducto(productoId) {
        return this.carrito.some(item => item.id === productoId);
    }

    getCantidadProducto(productoId) {
        const item = this.carrito.find(item => item.id === productoId);
        return item ? item.cantidad : 0;
    }

    debug() {
        console.log('🔍 Debug CarritoManager (local):', {
            isInitialized: this.isInitialized,
            carrito: {
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
        this.carrito = [];
        this.guardarCarrito();
        console.log('🔄 Carrito local reiniciado');
    }
}

// Hacer disponible globalmente
window.CarritoManager = CarritoManager;

// Inicializar automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    if (!window.carritoManager) {
        window.carritoManager = new CarritoManager();
        window.carritoManager.inicializar();
    }
});