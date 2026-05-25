const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

function replaceInDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('purple')) {
        content = content.replace(/purple/g, 'rose');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    replaceInDirectory(dir);
  }
}
