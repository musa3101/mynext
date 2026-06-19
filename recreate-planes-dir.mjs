import fs from 'fs';

try {
  console.log('Creating planes-fresh directory...');
  fs.mkdirSync('planes-fresh', { recursive: true });

  console.log('Copying planes/index.html (Spanish) to planes-fresh/index.html...');
  fs.copyFileSync('planes/index.html', 'planes-fresh/index.html');

  console.log('Renaming planes folder to planes-old...');
  if (fs.existsSync('planes-old')) {
    fs.rmSync('planes-old', { recursive: true, force: true });
  }
  fs.renameSync('planes', 'planes-old');

  console.log('Renaming planes-fresh to planes...');
  fs.renameSync('planes-fresh', 'planes');

  console.log('Removing planes-old folder...');
  fs.rmSync('planes-old', { recursive: true, force: true });

  console.log('Successfully recreated planes directory!');
} catch (e) {
  console.error('Error recreating planes directory:', e.message);
}
