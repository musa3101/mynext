import { execSync } from 'child_process';

const files = [
  'planes/index.html',
  'planes/index-en.html'
];

for (const file of files) {
  try {
    console.log(`=== Extended Attributes for ${file} ===`);
    const output = execSync(`xattr -l "${file}"`).toString();
    console.log(output || '(no attributes)');
  } catch (e) {
    console.error(`Failed to check ${file}:`, e.message);
  }
}
