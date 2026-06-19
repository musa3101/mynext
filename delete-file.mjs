import fs from 'fs';
try {
  fs.unlinkSync('planes/index-en.html');
  console.log('Successfully deleted planes/index-en.html!');
} catch (e) {
  console.error('Failed to delete:', e.message);
}
