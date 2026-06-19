import fs from 'fs';

const filePath = 'planes/index-en.html';
try {
  if (fs.existsSync(filePath)) {
    console.log(`Reading content of ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Deleting ${filePath}...`);
    fs.unlinkSync(filePath);
    
    console.log(`Writing fresh copy of ${filePath}...`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Recreation completed successfully!');
  } else {
    console.log(`${filePath} does not exist.`);
  }
} catch (e) {
  console.error('Error during recreation:', e.message);
}
