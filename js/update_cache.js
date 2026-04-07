const fs = require('fs');
const path = require('path');

const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const v = Date.now(); // Cache buster único

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Reemplazar la referencia al script para añadir un cache buster ?v=xxx
  // Solo consideramos la etiqueta tal como está
  content = content.replace(/<script defer src="\.\.\/js\/main\.js(\?v=[0-9]+)?"><\/script>/g, `<script defer src="../js/main.js?v=${v}"></script>`);
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log(`Cache buster ?v=${v} insertado en scripts de 14 archivos HTML.`);
