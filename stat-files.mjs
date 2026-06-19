import fs from 'fs';

try {
  const content = fs.readFileSync('planes/hello.html', 'utf8');
  console.log('Successfully read planes/hello.html!', content);
} catch (e) {
  console.error('Failed to read planes/hello.html:', e.message);
}
