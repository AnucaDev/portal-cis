const fs = require('fs');
const path = require('path');

const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const scriptRegex = /<script>[\s\S]*?<\/script>/gis;

let updated = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // 1. Eliminar todos los bloques <script> ... </script>
  content = content.replace(scriptRegex, '');
  
  // Limpiar atributo onsubmit del form por si acaso (aunque main.js también lo maneja)
  content = content.replace(/onsubmit="return enviarCita\(event\)"/, '');
  
  // Eliminar onclicks del html para evitar llamadas globales no declaradas
  content = content.replace(/onclick="toggleMenu\(\)"/g, '');
  content = content.replace(/onclick="moveCarousel\((.*?)\)"/g, '');
  
  // 2. Insertar el script externo justo antes del cierre de body
  if (content.includes('</body>')) {
    // Eliminar si por algún motivo se añadió más de una vez antes
    content = content.replace(/<script defer src="\.\.\/js\/main\.js"><\/script>\n/g, '');
    content = content.replace(/<\/body>/, '<script defer src="../js/main.js"></script>\n</body>');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updated++;
  }
}
console.log(`Scripts inline eliminados y main.js enlazado en ${updated} archivos HTML.`);
