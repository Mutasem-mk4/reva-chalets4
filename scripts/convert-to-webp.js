// Script to convert PNG images to WebP format
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

const imagesToConvert = [
    'hero.png',
    'chalet-1.png',
    'chalet-2.png',
    'chalet-3.png',
    'chalet-4.png'
];

async function convertImages() {
    console.log('Converting PNG images to WebP...\n');

    for (const imageName of imagesToConvert) {
        const inputPath = path.join(imagesDir, imageName);
        const outputName = imageName.replace('.png', '.webp');
        const outputPath = path.join(imagesDir, outputName);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  ${imageName} not found, skipping...`);
            continue;
        }

        try {
            const inputStats = fs.statSync(inputPath);

            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            const outputStats = fs.statSync(outputPath);
            const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

            console.log(`✅ ${imageName} → ${outputName}`);
            console.log(`   PNG: ${(inputStats.size / 1024).toFixed(0)}KB → WebP: ${(outputStats.size / 1024).toFixed(0)}KB (${savings}% smaller)\n`);
        } catch (error) {
            console.error(`❌ Error converting ${imageName}:`, error.message);
        }
    }

    console.log('Done! WebP images created in public/images/');
}

convertImages();
