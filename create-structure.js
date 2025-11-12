const fs = require('node:fs');
const path = require('node:path');

const structure = [
    'src/controllers',
    'src/models', 
    'src/routes',
    'src/services',
    'src/middleware',
    'src/utils',
    'src/config',
    'public/css',
    'public/js',
    'views'
];

console.log('🏗 Creando estructura de carpetas...');

// Usar for...of en lugar de forEach
for (const dir of structure) {
    const dirPath = path.join(__dirname, dir);
    
    // Condición positiva en lugar de negada
    if (fs.existsSync(dirPath)) {
        console.log(`📁 Ya existe: ${dir}`);
    } else {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Creando: ${dir}`);
    }
}

console.log('🎉 Estructura creada!');