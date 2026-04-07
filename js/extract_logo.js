const fs = require('fs');
const path = require('path');

const imgPath = 'C:/CIS2026/imagenes/logo.svg';

if (!fs.existsSync(imgPath)) {
  console.error('No se encontró logo.svg en imagenes/. Coloca el archivo antes de ejecutar este script.');
  process.exit(1);
}

// Limpiar todos los archivos HTML y reemplazar SVG inline por <img>
const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Expresión regular que atrapa la gran etiqueta <svg ...> </svg>
const svgRegex = /<svg[^>]*>[\s\S]*?<\/svg>/g;

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (svgRegex.test(content)) {
    // Lo sustituimos por la clásica etiqueta IMG que pide el usuario
    content = content.replace(svgRegex, '<img class="logo-svg" src="../imagenes/logo.svg" alt="Logotipo CIS" />');
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
}
console.log(`Logotipo guardado en imágenes y código HTML limpiado en ${count} archivos.`);
