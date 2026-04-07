const fs = require('fs');
const path = require('path');

const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldLogoRegex = /<svg class="logo-svg" viewBox="0 0 100 100" xmlns="http:\/\/www\.w3\.org\/2000\/svg">.*?<\/svg>\s*<div class="logo-text"><h1>CIS<\/h1><span>Centro de Intervención Sicoeducativa<\/span><\/div>/gs;

const newLogo = `<img class="logo-svg" src="../imagenes/logo.svg" alt="Logotipo CIS" />
        <div class="logo-text"><h1>CIS</h1><span>Centro de Intervención Psicoeducativa</span></div>`;

let updatedHtml = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(oldLogoRegex, newLogo);
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedHtml++;
  }
}
console.log(`Logotipo humano y cálido actualizado en ${updatedHtml} archivos HTML.`);
