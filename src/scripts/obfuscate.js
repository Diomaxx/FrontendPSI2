const fs = require('fs');
const path = require('path');
const obfuscator = require('javascript-obfuscator');

const jsDir = path.join(__dirname, '../dist/assets');

fs.readdirSync(jsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(jsDir, file);
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscated = obfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
    });
    fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
    console.log(`✅ Ofuscado: ${file}`);
  }
});
