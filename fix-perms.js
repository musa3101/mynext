const fs = require('fs');
try {
  fs.chmodSync('planes/index-en.html', 0o666);
  console.log('Successfully changed permissions for planes/index-en.html');
} catch (e) {
  console.error('Failed to change permissions:', e);
}
