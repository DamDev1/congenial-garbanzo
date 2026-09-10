const sharp = require('sharp');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'public', 'icon-192x192.jpg');

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(__dirname, '..', 'public', `icon-${size}x${size}.png`);
    await sharp(inputFile)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outputFile);
    console.log(`Created icon-${size}x${size}.png`);
  }
  console.log('Done!');
}

generateIcons().catch(console.error);
