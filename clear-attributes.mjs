import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

console.log('Finding and clearing extended attributes...');
walkDir('.', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.json')) {
    try {
      const attrs = execSync(`xattr "${filePath}"`).toString().trim();
      if (attrs) {
        console.log(`Clearing attributes on ${filePath}: ${attrs.replace(/\n/g, ', ')}`);
        execSync(`xattr -c "${filePath}"`);
      }
    } catch (e) {
      // Ignore files without attributes or errors
    }
  }
});
console.log('All clear!');
