const fs = require('fs');
const path = require('path');

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

structure.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Creando: ${dir}`);
    } else {
        console.log(`📁 Ya existe: ${dir}`);
    }
});

console.log('🎉 Estructura creada!');