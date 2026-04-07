const fs = require('fs');
const path = require('path');

const dir = 'C:/CIS2026/html';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let replacedCount = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/<div class="disorder-icon ic-tea">.*?<\/div>/g, '<div class="disorder-icon ic-tea">♾️</div>');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    replacedCount++;
  }
}
console.log(`Icono de TEA actualizado a ♾️ en ${replacedCount} archivos HTML.`);
