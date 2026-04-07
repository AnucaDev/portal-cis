const fs = require('fs');
const path = require('path');

const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Link al portal
const loginLink = `<li><a href="login.html" class="btn btn-outline" style="padding:.4rem 1rem; border-radius:20px; font-size:.85rem; gap:.4rem; display:inline-flex; align-items:center;">👤 Zona Familias</a></li>`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Insertar link en index.html al final de los nav-links
  if (file === 'index.html') {
    if (!content.includes('Zona Familias')) {
      content = content.replace(/(<li><a href="#contacto">Contacto<\/a><\/li>)\s*(<\/ul>)/, `$1\n        ${loginLink}\n$2`);
    }
  } else {
    // Si no es index.html y tiene nav-links
    if (content.includes('nav-links') && !content.includes('Zona Familias')) {
      content = content.replace(/(<li><a href="index\.html">.*?<\/a><\/li>)\s*(<\/ul>)/, `$1\n        ${loginLink}\n$2`);
    }
  }

  // Importar el nuevo CSS justo debajo del styles.css en el <head>
  if (!content.includes('estilos_portal.css') && content.includes('<link rel="stylesheet" href="../css/styles.css" />')) {
    content = content.replace('<link rel="stylesheet" href="../css/styles.css" />', '<link rel="stylesheet" href="../css/styles.css" />\n  <link rel="stylesheet" href="../css/estilos_portal.css" />');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log('Menús actualizados con el acceso al área de familias e importación de CSS añadida.');
