const fs = require('fs');
const path = require('path');

const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const original = content;
  // Busca el enlace de contacto con clases de botón y lo deja limpio
  content = content.replace(/<a href="#contacto" class="btn btn-primary"[^>]*>Contacto<\/a>/g, '<a href="#contacto">Contacto</a>');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
}
console.log(`Menú actualizado en ${count} archivos HTML.`);
