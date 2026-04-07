const fs = require('fs');
const path = require('path');

const baseDir = 'C:/CIS2026';
const htmlDir = path.join(baseDir, 'html');
const cssPath = path.join(baseDir, 'css', 'styles.css');
const jsPath = path.join(baseDir, 'js', 'main.js');

function fixTextInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  let newContent = content.replace(/Ppsicoeducativa/g, 'Psicoeducativa');
  newContent = newContent.replace(/ppsicoeducativa/g, 'psicoeducativa');
  newContent = newContent.replace(/PPsicoeducativa/g, 'Psicoeducativa');
  newContent = newContent.replace(/PPSICOEDUCATIVA/g, 'PSICOEDUCATIVA');
  newContent = newContent.replace(/Ppiscoeducativa/g, 'Psicoeducativa'); // Por si acaso
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Corregido en: ${filePath}`);
  }
}

// 1. Archivos HTML
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  fixTextInFile(path.join(htmlDir, file));
}

// 2. CSS y JS
fixTextInFile(cssPath);
fixTextInFile(jsPath);

console.log('Corrección de error tipográfico completada.');
