const fs = require('fs');
const path = require('path');

const baseDir = 'C:/CIS2026';
const htmlDir = path.join(baseDir, 'html');
const cssPath = path.join(baseDir, 'css', 'styles.css');
const jsPath = path.join(baseDir, 'js', 'main.js');

function replaceTextInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  let newContent = content.replace(/Sicoeducativa/g, 'Psicoeducativa');
  newContent = newContent.replace(/sicoeducativa/g, 'psicoeducativa');
  newContent = newContent.replace(/SICOEDUCATIVA/g, 'PSICOEDUCATIVA');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

// 1. Actualizamos HTML
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  replaceTextInFile(path.join(htmlDir, file));
}

// 2. Actualizamos CSS y JS principal (si hubiera comentarios o similares)
replaceTextInFile(cssPath);
replaceTextInFile(jsPath);

console.log('Reemplazo de "Sicoeducativa" a "Psicoeducativa" completado.');
