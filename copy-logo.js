import fs from 'fs';
try {
  fs.copyFileSync('nuevos logos de hero para la web de mynext/2.svg', 'public/assets/img/logos/logo-hero-v2-white.svg');
  console.log('Successfully copied 2.svg to public/assets/img/logos/logo-hero-v2-white.svg');
} catch (e) {
  console.error('Copy failed:', e);
}
